// Document management service for NAVIAR CONSULT
// Handles file uploads, storage, encryption, and retrieval

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');
const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

class DocumentService {
  constructor() {
    this.storageType = config.storage.type;
    this.encryptionEnabled = true;
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('[DOCUMENTS] Failed to create upload directory:', error);
      throw error;
    }
  }

  encrypt(data, key = this.encryptionKey) {
    if (!this.encryptionEnabled) return data;

    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(key, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);

    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return Buffer.concat([iv, encrypted]).toString('hex');
  }

  decrypt(encryptedData, key = this.encryptionKey) {
    if (!this.encryptionEnabled) return encryptedData;

    try {
      const buffer = Buffer.from(encryptedData, 'hex');
      const iv = buffer.slice(0, 16);
      const encrypted = buffer.slice(16);
      const keyBuffer = Buffer.from(key, 'hex');

      const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf-8');
    } catch (error) {
      console.error('[DOCUMENTS] Decryption failed:', error);
      throw error;
    }
  }

  generateDocumentId() {
    return `doc_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  getDocumentPath(documentId) {
    return path.join(UPLOAD_DIR, documentId);
  }

  async uploadDocument(file, metadata) {
    try {
      await this.ensureUploadDir();

      const documentId = this.generateDocumentId();
      const documentPath = this.getDocumentPath(documentId);

      // Store file metadata
      const meta = {
        id: documentId,
        originalName: metadata.originalName,
        mimeType: metadata.mimeType,
        size: file.length,
        orgId: metadata.orgId,
        uploadedBy: metadata.uploadedBy,
        isConfidential: metadata.isConfidential || false,
        uploadedAt: new Date(),
        tags: metadata.tags || []
      };

      // Encrypt file content if confidential
      let fileContent = file;
      if (meta.isConfidential) {
        fileContent = this.encrypt(file.toString());
      }

      // Write file
      await fs.writeFile(documentPath, fileContent);

      // Store metadata
      const metaPath = `${documentPath}.meta.json`;
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

      console.log(`[DOCUMENTS] Uploaded document ${documentId} (${meta.originalName})`);

      return {
        success: true,
        documentId,
        ...meta,
        message: 'Document uploaded successfully'
      };
    } catch (error) {
      console.error('[DOCUMENTS] Upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getDocument(documentId) {
    try {
      const documentPath = this.getDocumentPath(documentId);
      const metaPath = `${documentPath}.meta.json`;

      // Read metadata
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const meta = JSON.parse(metaContent);

      // Read file
      let fileContent = await fs.readFile(documentPath);

      // Decrypt if confidential
      if (meta.isConfidential) {
        fileContent = Buffer.from(this.decrypt(fileContent.toString()));
      }

      return {
        success: true,
        documentId,
        metadata: meta,
        content: fileContent,
        contentType: meta.mimeType
      };
    } catch (error) {
      console.error('[DOCUMENTS] Failed to retrieve document:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteDocument(documentId) {
    try {
      const documentPath = this.getDocumentPath(documentId);
      const metaPath = `${documentPath}.meta.json`;

      // Delete file and metadata
      await fs.unlink(documentPath);
      await fs.unlink(metaPath);

      console.log(`[DOCUMENTS] Deleted document ${documentId}`);

      return {
        success: true,
        documentId,
        message: 'Document deleted successfully'
      };
    } catch (error) {
      console.error('[DOCUMENTS] Failed to delete document:', error);
      return { success: false, error: error.message };
    }
  }

  async listDocuments(orgId, filters = {}) {
    try {
      await this.ensureUploadDir();

      const files = await fs.readdir(UPLOAD_DIR);
      const documents = [];

      for (const file of files) {
        if (file.endsWith('.meta.json')) {
          const metaPath = path.join(UPLOAD_DIR, file);
          const metaContent = await fs.readFile(metaPath, 'utf-8');
          const meta = JSON.parse(metaContent);

          // Filter by org and other criteria
          if (meta.orgId === orgId) {
            if (filters.uploadedBy && meta.uploadedBy !== filters.uploadedBy) continue;
            if (filters.isConfidential !== undefined && meta.isConfidential !== filters.isConfidential) continue;
            if (filters.tag && !meta.tags.includes(filters.tag)) continue;

            documents.push(meta);
          }
        }
      }

      // Sort by upload date (newest first)
      documents.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

      return {
        success: true,
        documents,
        total: documents.length
      };
    } catch (error) {
      console.error('[DOCUMENTS] Failed to list documents:', error);
      return { success: false, error: error.message };
    }
  }

  async updateDocumentMetadata(documentId, updates) {
    try {
      const documentPath = this.getDocumentPath(documentId);
      const metaPath = `${documentPath}.meta.json`;

      // Read current metadata
      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const meta = JSON.parse(metaContent);

      // Update allowed fields
      if (updates.tags !== undefined) meta.tags = updates.tags;
      if (updates.isConfidential !== undefined) meta.isConfidential = updates.isConfidential;

      // Write updated metadata
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

      console.log(`[DOCUMENTS] Updated metadata for document ${documentId}`);

      return {
        success: true,
        documentId,
        metadata: meta,
        message: 'Document metadata updated successfully'
      };
    } catch (error) {
      console.error('[DOCUMENTS] Failed to update metadata:', error);
      return { success: false, error: error.message };
    }
  }

  async shareDocument(documentId, recipientEmail, expiresIn = null) {
    try {
      const documentPath = this.getDocumentPath(documentId);
      const metaPath = `${documentPath}.meta.json`;

      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const meta = JSON.parse(metaContent);

      // Generate share token
      const shareToken = crypto.randomBytes(32).toString('hex');
      const expiryDate = expiresIn ? new Date(Date.now() + expiresIn) : null;

      meta.shares = meta.shares || [];
      meta.shares.push({
        token: shareToken,
        recipientEmail,
        sharedAt: new Date(),
        expiresAt: expiryDate
      });

      // Write updated metadata
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

      console.log(`[DOCUMENTS] Document ${documentId} shared with ${recipientEmail}`);

      return {
        success: true,
        documentId,
        shareToken,
        recipientEmail,
        expiresAt: expiryDate,
        message: 'Document shared successfully'
      };
    } catch (error) {
      console.error('[DOCUMENTS] Failed to share document:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyShareAccess(documentId, shareToken) {
    try {
      const documentPath = this.getDocumentPath(documentId);
      const metaPath = `${documentPath}.meta.json`;

      const metaContent = await fs.readFile(metaPath, 'utf-8');
      const meta = JSON.parse(metaContent);

      if (!meta.shares) {
        return { success: false, error: 'Document has no shares' };
      }

      const share = meta.shares.find(s => s.token === shareToken);
      if (!share) {
        return { success: false, error: 'Invalid share token' };
      }

      // Check expiry
      if (share.expiresAt && new Date() > new Date(share.expiresAt)) {
        return { success: false, error: 'Share link has expired' };
      }

      return {
        success: true,
        documentId,
        recipientEmail: share.recipientEmail,
        expiresAt: share.expiresAt
      };
    } catch (error) {
      console.error('[DOCUMENTS] Failed to verify share access:', error);
      return { success: false, error: error.message };
    }
  }

  async getDocumentStats(orgId) {
    try {
      const listResult = await this.listDocuments(orgId);
      if (!listResult.success) {
        return listResult;
      }

      const documents = listResult.documents;
      const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
      const confidentialCount = documents.filter(doc => doc.isConfidential).length;

      return {
        success: true,
        stats: {
          totalDocuments: documents.length,
          totalSize,
          totalSizeGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2),
          confidentialDocuments: confidentialCount,
          publicDocuments: documents.length - confidentialCount,
          byType: documents.reduce((acc, doc) => {
            const ext = doc.originalName.split('.').pop().toLowerCase();
            acc[ext] = (acc[ext] || 0) + 1;
            return acc;
          }, {})
        }
      };
    } catch (error) {
      console.error('[DOCUMENTS] Failed to get stats:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new DocumentService();
