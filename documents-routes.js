// Document management routes for NAVIAR CONSULT
// Handles file uploads, storage, sharing, and retrieval

const express = require('express');
const db = require('./db');
const auth = require('./auth');
const utils = require('./utils');
const documents = require('./documents');

const router = express.Router();

// Upload document
router.post('/documents/upload', auth.authenticate, async (req, res) => {
  try {
    const { orgId, fileName, fileData, isConfidential = false, tags = [] } = req.body;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'File name and data required' });
    }

    // Verify org access
    const org = await db.queryOne(
      'SELECT * FROM organizations WHERE id = $1',
      [orgId]
    );

    if (!org) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Upload document
    const uploadResult = await documents.uploadDocument(
      Buffer.from(fileData, 'base64'),
      {
        originalName: fileName,
        mimeType: req.body.mimeType || 'application/octet-stream',
        orgId,
        uploadedBy: req.user.userId,
        isConfidential,
        tags
      }
    );

    if (!uploadResult.success) {
      return res.status(400).json({ error: uploadResult.error });
    }

    // Store document record in database
    await db.execute(
      `INSERT INTO documents
       (id, org_id, original_name, mime_type, size, is_confidential, uploaded_by, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        uploadResult.documentId,
        orgId,
        uploadResult.originalName,
        uploadResult.mimeType,
        uploadResult.size,
        isConfidential,
        req.user.userId
      ]
    );

    res.status(201).json({
      documentId: uploadResult.documentId,
      fileName: uploadResult.originalName,
      size: uploadResult.size,
      isConfidential,
      uploadedAt: uploadResult.uploadedAt,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('[DOCUMENTS] Upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get document metadata
router.get('/documents/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    // Check access
    const doc = await db.queryOne(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({
      id: doc.id,
      fileName: doc.original_name,
      mimeType: doc.mime_type,
      size: doc.size,
      isConfidential: doc.is_confidential,
      uploadedBy: doc.uploaded_by,
      uploadedAt: doc.uploaded_at
    });
  } catch (error) {
    console.error('[DOCUMENTS] Fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Download document
router.get('/documents/:id/download', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    // Check access
    const doc = await db.queryOne(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get document content
    const docResult = await documents.getDocument(id);
    if (!docResult.success) {
      return res.status(400).json({ error: docResult.error });
    }

    res.setHeader('Content-Type', docResult.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.original_name}"`);
    res.send(docResult.content);
  } catch (error) {
    console.error('[DOCUMENTS] Download error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Delete document
router.delete('/documents/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    // Check access
    const doc = await db.queryOne(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from storage
    const deleteResult = await documents.deleteDocument(id);
    if (!deleteResult.success) {
      return res.status(400).json({ error: deleteResult.error });
    }

    // Delete from database
    await db.execute(
      'DELETE FROM documents WHERE id = $1',
      [id]
    );

    res.json({
      documentId: id,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('[DOCUMENTS] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// List documents
router.get('/documents', auth.authenticate, async (req, res) => {
  try {
    const { orgId, limit = 20, offset = 0 } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const docs = await db.queryMany(
      `SELECT * FROM documents WHERE org_id = $1 ORDER BY uploaded_at DESC LIMIT $2 OFFSET $3`,
      [orgId, limit, offset]
    );

    const countResult = await db.queryOne(
      'SELECT COUNT(*) as count FROM documents WHERE org_id = $1',
      [orgId]
    );

    res.json(utils.formatPaginatedResponse(docs, countResult.count, 1, limit));
  } catch (error) {
    console.error('[DOCUMENTS] List error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Update document metadata
router.patch('/documents/:id', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { isConfidential, tags } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    // Check access
    const doc = await db.queryOne(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update in database
    if (isConfidential !== undefined) {
      await db.execute(
        'UPDATE documents SET is_confidential = $1 WHERE id = $2',
        [isConfidential, id]
      );
    }

    res.json({
      documentId: id,
      isConfidential: isConfidential !== undefined ? isConfidential : doc.is_confidential,
      tags,
      message: 'Document metadata updated successfully'
    });
  } catch (error) {
    console.error('[DOCUMENTS] Update error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Share document
router.post('/documents/:id/share', auth.authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientEmail, expiresIn } = req.body;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email required' });
    }

    // Check access
    const doc = await db.queryOne(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Share document
    const shareResult = await documents.shareDocument(
      id,
      recipientEmail,
      expiresIn ? parseInt(expiresIn) : 7 * 24 * 60 * 60 * 1000 // 7 days default
    );

    if (!shareResult.success) {
      return res.status(400).json({ error: shareResult.error });
    }

    res.status(201).json({
      documentId: id,
      shareToken: shareResult.shareToken,
      recipientEmail,
      expiresAt: shareResult.expiresAt,
      shareLink: `/api/documents/${id}/verify-access?token=${shareResult.shareToken}`,
      message: 'Document shared successfully'
    });
  } catch (error) {
    console.error('[DOCUMENTS] Share error:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

// Verify share access
router.get('/documents/:id/verify-access', async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    if (!utils.isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid document ID' });
    }

    if (!token) {
      return res.status(400).json({ error: 'Share token required' });
    }

    // Verify access
    const verifyResult = await documents.verifyShareAccess(id, token);
    if (!verifyResult.success) {
      return res.status(403).json({ error: verifyResult.error });
    }

    res.json({
      documentId: id,
      recipientEmail: verifyResult.recipientEmail,
      expiresAt: verifyResult.expiresAt,
      message: 'Share access verified'
    });
  } catch (error) {
    console.error('[DOCUMENTS] Verify error:', error);
    res.status(500).json({ error: 'Failed to verify share access' });
  }
});

// Get document statistics
router.get('/documents/stats/overview', auth.authenticate, async (req, res) => {
  try {
    const { orgId } = req.query;

    if (!utils.isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const statsResult = await documents.getDocumentStats(orgId);
    if (!statsResult.success) {
      return res.status(400).json({ error: statsResult.error });
    }

    res.json(statsResult.stats);
  } catch (error) {
    console.error('[DOCUMENTS] Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
