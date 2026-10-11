'use client';

import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import {
  Archive,
  ArchiveRestore,
  Download,
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  HardDrive,
  LayoutGrid,
  Link2,
  List,
  Presentation,
  Share2,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { useAnnounce } from '@/components/Announcer';
import { useDemoData } from '@/components/DemoDataProvider';
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  Modal,
  Pagination,
  SearchField,
  SelectField,
  StatTile,
  ToggleGroup,
} from '@/components/ui';
import { DOC_CATEGORIES, DEPARTMENTS, newId, type AccessLevel, type DocCategory, type DocRecord, type FileKind } from '@/lib/demo-data';
import { formatDate, formatDateTime, formatSize, relativeTime } from '@/lib/format';

const PAGE_SIZE = 12;
const MAX_UPLOAD_MB = 25;

type Library = 'all' | 'starred' | 'archived' | DocCategory;
type SortKey = 'updated' | 'name' | 'size';

const KIND_ICON: Record<FileKind, typeof File> = {
  pdf: FileText,
  docx: FileText,
  xlsx: FileSpreadsheet,
  pptx: Presentation,
  image: FileImage,
  other: File,
};
const KIND_LABEL: Record<FileKind, string> = {
  pdf: 'PDF',
  docx: 'Word',
  xlsx: 'Excel',
  pptx: 'PowerPoint',
  image: 'Image',
  other: 'File',
};
const ACCESS_LABEL: Record<AccessLevel, string> = { private: 'Private', team: 'Team', organization: 'Organisation' };
const ACCESS_TONE = { private: 'muted', team: 'brass', organization: 'green' } as const;
const ACCESS_HELP: Record<AccessLevel, string> = {
  private: 'Only you and admins can open it.',
  team: 'People in the selected departments can open it.',
  organization: 'Everyone in the workspace can open it.',
};

function kindFromName(name: string): FileKind {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext)) return 'docx';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return 'xlsx';
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) return 'pptx';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  return 'other';
}

function FileIcon({ kind, size = 20 }: { kind: FileKind; size?: number }) {
  const Icon = KIND_ICON[kind];
  return (
    <span aria-hidden="true" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded bg-mist text-primary-500">
      <Icon size={size} />
    </span>
  );
}

export default function DocumentsPage() {
  const { documents, setDocuments, logAudit } = useDemoData();
  const announce = useAnnounce();

  const [library, setLibrary] = useState<Library>('all');
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<'all' | FileKind>('all');
  const [sort, setSort] = useState<SortKey>('updated');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploadCategory, setUploadCategory] = useState<DocCategory>('Meeting notes');
  const [dragging, setDragging] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [newTag, setNewTag] = useState('');
  const [toDelete, setToDelete] = useState<DocRecord[] | null>(null);
  const [moveTo, setMoveTo] = useState<DocCategory>('Reports');
  const fileInput = useRef<HTMLInputElement>(null);
  const versionInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (library !== 'all' && library !== 'starred' && library !== 'archived') setUploadCategory(library);
  }, [library]);

  const preview = documents.find((d) => d.id === previewId) ?? null;
  const sharing = documents.find((d) => d.id === shareId) ?? null;

  const stats = useMemo(() => {
    const live = documents.filter((d) => !d.archived);
    const weekAgo = Date.now() - 7 * 86400000;
    return {
      count: live.length,
      size: live.reduce((sum, d) => sum + d.sizeKB, 0),
      shared: live.filter((d) => d.access !== 'private').length,
      recent: live.filter((d) => new Date(d.updatedAt).getTime() >= weekAgo).length,
    };
  }, [documents]);

  const counts = useMemo(() => {
    const map = new Map<Library, number>();
    for (const d of documents) {
      if (d.archived) {
        map.set('archived', (map.get('archived') ?? 0) + 1);
        continue;
      }
      map.set('all', (map.get('all') ?? 0) + 1);
      map.set(d.category, (map.get(d.category) ?? 0) + 1);
      if (d.starred) map.set('starred', (map.get('starred') ?? 0) + 1);
    }
    return map;
  }, [documents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = documents.filter((d) => {
      if (library === 'archived') {
        if (!d.archived) return false;
      } else {
        if (d.archived) return false;
        if (library === 'starred' && !d.starred) return false;
        if (library !== 'all' && library !== 'starred' && d.category !== library) return false;
      }
      if (kind !== 'all' && d.kind !== kind) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || d.tags.some((t) => t.toLowerCase().includes(q)) || d.owner.toLowerCase().includes(q);
    });
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'size') return b.sizeKB - a.sizeKB;
      return b.updatedAt.localeCompare(a.updatedAt);
    });
  }, [documents, library, kind, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedDocs = filtered.filter((d) => selected.has(d.id));

  const patch = (id: string, change: Partial<DocRecord>) =>
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...change } : d)));

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted: DocRecord[] = [];
    const rejected: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
        rejected.push(file.name);
        return;
      }
      const url = URL.createObjectURL(file);
      const nowIso = new Date().toISOString();
      accepted.push({
        id: newId('doc'),
        name: file.name,
        category: uploadCategory,
        kind: kindFromName(file.name),
        sizeKB: file.size / 1024,
        owner: 'Demo Admin',
        uploadedAt: nowIso,
        updatedAt: nowIso,
        tags: [],
        access: 'private',
        sharedWith: [],
        versions: [{ version: 1, date: nowIso, author: 'Demo Admin', note: 'Initial upload' }],
        starred: false,
        archived: false,
        fileUrl: url,
      });
    });
    if (accepted.length) {
      setDocuments((prev) => [...accepted, ...prev]);
      accepted.forEach((d) => logAudit('Demo Admin', 'Uploaded document', d.name));
    }
    const parts: string[] = [];
    if (accepted.length) parts.push(`${accepted.length} file${accepted.length === 1 ? '' : 's'} added to ${uploadCategory} (kept in this browser session only)`);
    if (rejected.length) parts.push(`${rejected.length} skipped — larger than ${MAX_UPLOAD_MB} MB`);
    announce(`${parts.join('. ')}.`);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const uploadVersion = (files: FileList | null) => {
    const file = files?.[0];
    if (!preview || !file) return;
    const url = URL.createObjectURL(file);
    const nowIso = new Date().toISOString();
    const nextVersion = (preview.versions[preview.versions.length - 1]?.version ?? 0) + 1;
    patch(preview.id, {
      versions: [...preview.versions, { version: nextVersion, date: nowIso, author: 'Demo Admin', note: `Replaced with ${file.name}` }],
      updatedAt: nowIso,
      sizeKB: file.size / 1024,
      fileUrl: url,
    });
    logAudit('Demo Admin', 'Uploaded new version', `${preview.name} v${nextVersion}`);
    announce(`Version ${nextVersion} uploaded.`);
  };

  const download = (d: DocRecord) => {
    if (!d.fileUrl) return;
    const a = document.createElement('a');
    a.href = d.fileUrl;
    a.download = d.name;
    a.click();
  };

  const toggleStar = (d: DocRecord) => {
    patch(d.id, { starred: !d.starred });
    announce(d.starred ? `${d.name} removed from starred.` : `${d.name} starred.`);
  };

  const setArchived = (docs: DocRecord[], archived: boolean) => {
    const ids = new Set(docs.map((d) => d.id));
    setDocuments((prev) => prev.map((d) => (ids.has(d.id) ? { ...d, archived } : d)));
    setSelected(new Set());
    logAudit('Demo Admin', archived ? 'Archived document' : 'Restored document', docs.map((d) => d.name).join(', '));
    announce(`${docs.length} document${docs.length === 1 ? '' : 's'} ${archived ? 'archived' : 'restored'}.`);
  };

  const remove = (docs: DocRecord[]) => {
    const ids = new Set(docs.map((d) => d.id));
    setDocuments((prev) => prev.filter((d) => !ids.has(d.id)));
    setSelected((prev) => new Set([...prev].filter((id) => !ids.has(id))));
    setPreviewId(null);
    logAudit('Demo Admin', 'Deleted document', docs.map((d) => d.name).join(', '));
    announce(`${docs.length} document${docs.length === 1 ? '' : 's'} deleted.`);
  };

  const moveSelected = () => {
    const ids = new Set(selectedDocs.map((d) => d.id));
    setDocuments((prev) => prev.map((d) => (ids.has(d.id) ? { ...d, category: moveTo } : d)));
    logAudit('Demo Admin', 'Moved documents', `${ids.size} → ${moveTo}`);
    announce(`${ids.size} document${ids.size === 1 ? '' : 's'} moved to ${moveTo}.`);
    setSelected(new Set());
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOnPage = pageItems.length > 0 && pageItems.every((d) => selected.has(d.id));

  const libraryButton = (value: Library, label: string, Icon: typeof File) => (
    <li key={value}>
      <button
        type="button"
        aria-pressed={library === value}
        onClick={() => {
          setLibrary(value);
          setPage(1);
          setSelected(new Set());
        }}
        className={`flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors duration-fast ${
          library === value ? 'bg-primary-600 text-white' : 'text-ink-soft hover:bg-mist'
        }`}
      >
        <Icon size={16} aria-hidden="true" />
        <span className="flex-1 truncate text-left">{label}</span>
        <span className="tabular-nums">{counts.get(value) ?? 0}</span>
      </button>
    </li>
  );

  const actions = (d: DocRecord) => (
    <div className="flex items-center justify-end gap-0.5">
      <button type="button" className="btn-ghost btn-sm" onClick={() => toggleStar(d)} aria-pressed={d.starred}>
        <Star size={16} aria-hidden="true" className={d.starred ? 'fill-accent-500 text-accent-600' : ''} />
        <span className="sr-only">Star {d.name}</span>
      </button>
      <button type="button" className="btn-ghost btn-sm" onClick={() => setPreviewId(d.id)}>
        <Eye size={16} aria-hidden="true" />
        <span className="sr-only">Open {d.name}</span>
      </button>
      <button type="button" className="btn-ghost btn-sm" onClick={() => setShareId(d.id)}>
        <Share2 size={16} aria-hidden="true" />
        <span className="sr-only">Share {d.name}</span>
      </button>
    </div>
  );

  return (
    <AppShell
      eyebrow="Library"
      title="Documents"
      description="Policies, contracts, reports and meeting notes in one place, with access levels and version history."
      actions={
        <button type="button" className="btn-primary" onClick={() => fileInput.current?.click()}>
          <Upload size={16} aria-hidden="true" /> Upload
        </button>
      }
    >
      <input ref={fileInput} type="file" multiple className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => {
        handleFiles(e.target.files);
        e.target.value = '';
      }} />

      <section aria-label="Summary" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Documents" value={stats.count} icon={<FileText size={18} />} />
        <StatTile label="Storage used" value={formatSize(stats.size)} icon={<HardDrive size={18} />} />
        <StatTile label="Shared" value={stats.shared} hint="Team or organisation access" icon={<Share2 size={18} />} />
        <StatTile label="Updated this week" value={stats.recent} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Library" className="card h-fit p-3">
          <ul className="space-y-0.5">
            {libraryButton('all', 'All documents', FolderOpen)}
            {libraryButton('starred', 'Starred', Star)}
            {libraryButton('archived', 'Archived', Archive)}
          </ul>
          <p className="eyebrow mb-1 mt-4 px-2.5">Folders</p>
          <ul className="space-y-0.5">{DOC_CATEGORIES.map((c) => libraryButton(c, c, FolderOpen))}</ul>
        </nav>

        <div className="min-w-0 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center gap-3 rounded border-2 border-dashed px-4 py-6 text-center transition-colors duration-fast sm:flex-row sm:text-left ${
              dragging ? 'border-primary-500 bg-mist' : 'border-line-strong bg-white'
            }`}
          >
            <Upload size={24} aria-hidden="true" className="shrink-0 text-primary-500" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium text-ink">Drop files here or browse</p>
              <p className="text-muted">Up to {MAX_UPLOAD_MB} MB per file. Files stay in this browser session in the demo.</p>
            </div>
            <div className="flex flex-wrap items-end justify-center gap-2">
              <SelectField
                label="Upload to folder"
                hideLabel
                value={uploadCategory}
                onChange={(v) => setUploadCategory(v as DocCategory)}
                options={DOC_CATEGORIES.map((c) => ({ value: c, label: `Folder: ${c}` }))}
              />
              <button type="button" className="btn-outline" onClick={() => fileInput.current?.click()}>
                Browse files
              </button>
            </div>
          </div>

          <section aria-labelledby="docs-heading" className="card min-w-0">
            <h2 id="docs-heading" className="sr-only">
              Files
            </h2>
            <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
              <SearchField value={query} onChange={(v) => { setQuery(v); setPage(1); }} label="Search documents" placeholder="Search name, tag or owner" />
              <div className="flex flex-wrap items-center gap-3">
                <SelectField
                  label="File type"
                  hideLabel
                  value={kind}
                  onChange={(v) => { setKind(v as 'all' | FileKind); setPage(1); }}
                  options={[{ value: 'all', label: 'All types' }, ...(Object.keys(KIND_LABEL) as FileKind[]).map((k) => ({ value: k, label: KIND_LABEL[k] }))]}
                />
                <SelectField
                  label="Sort by"
                  hideLabel
                  value={sort}
                  onChange={(v) => setSort(v as SortKey)}
                  options={[
                    { value: 'updated', label: 'Sort: Recently updated' },
                    { value: 'name', label: 'Sort: Name' },
                    { value: 'size', label: 'Sort: Size' },
                  ]}
                />
                <ToggleGroup
                  label="Layout"
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'list', label: 'List', icon: <List size={14} aria-hidden="true" /> },
                    { value: 'grid', label: 'Grid', icon: <LayoutGrid size={14} aria-hidden="true" /> },
                  ]}
                />
              </div>
            </div>

            {selectedDocs.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 border-b border-line bg-mist px-4 py-2.5 text-sm">
                <span className="mr-1 font-medium">{selectedDocs.length} selected</span>
                {library === 'archived' ? (
                  <button type="button" className="btn-outline btn-sm" onClick={() => setArchived(selectedDocs, false)}>
                    <ArchiveRestore size={14} aria-hidden="true" /> Restore
                  </button>
                ) : (
                  <>
                    <SelectField
                      label="Move to folder"
                      hideLabel
                      value={moveTo}
                      onChange={(v) => setMoveTo(v as DocCategory)}
                      options={DOC_CATEGORIES.map((c) => ({ value: c, label: `Move to ${c}` }))}
                    />
                    <button type="button" className="btn-outline btn-sm" onClick={moveSelected}>
                      Move
                    </button>
                    <button type="button" className="btn-outline btn-sm" onClick={() => setArchived(selectedDocs, true)}>
                      <Archive size={14} aria-hidden="true" /> Archive
                    </button>
                  </>
                )}
                <button type="button" className="btn-outline btn-sm text-danger-700" onClick={() => setToDelete(selectedDocs)}>
                  <Trash2 size={14} aria-hidden="true" /> Delete
                </button>
                <button type="button" className="btn-ghost btn-sm ml-auto" onClick={() => setSelected(new Set())}>
                  Clear
                </button>
              </div>
            ) : null}

            {filtered.length === 0 ? (
              <EmptyState icon={<FolderOpen size={32} />} title="No documents here">
                {library === 'archived' ? 'Archived documents show up here.' : 'Upload a file or try another search.'}
              </EmptyState>
            ) : view === 'list' ? (
              <ul className="divide-y divide-line">
                <li className="hidden items-center gap-3 bg-warm px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted xl:flex">
                  <input
                    type="checkbox"
                    checked={allOnPage}
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        pageItems.forEach((d) => (allOnPage ? next.delete(d.id) : next.add(d.id)));
                        return next;
                      })
                    }
                    aria-label="Select all on this page"
                    className="h-4 w-4 accent-primary-600"
                  />
                  <span className="flex-1">Name</span>
                  <span className="w-28">Access</span>
                  <span className="w-20 text-right">Size</span>
                  <span className="w-28">Updated</span>
                  <span className="w-[6.5rem]" />
                </li>
                {pageItems.map((d) => (
                  <li key={d.id} className={`flex items-center gap-3 px-4 py-3 ${selected.has(d.id) ? 'bg-mist/60' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(d.id)}
                      onChange={() => toggle(d.id)}
                      aria-label={`Select ${d.name}`}
                      className="h-4 w-4 shrink-0 accent-primary-600"
                    />
                    <button type="button" onClick={() => setPreviewId(d.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <FileIcon kind={d.kind} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink hover:underline">{d.name}</span>
                        <span className="block truncate text-xs text-muted">
                          {d.category} · {d.owner}
                          <span className="xl:hidden"> · {formatSize(d.sizeKB)}</span>
                        </span>
                      </span>
                    </button>
                    <span className="hidden w-28 xl:block">
                      <Badge tone={ACCESS_TONE[d.access]}>{ACCESS_LABEL[d.access]}</Badge>
                    </span>
                    <span className="hidden w-20 text-right text-sm tabular-nums text-ink-soft xl:block">{formatSize(d.sizeKB)}</span>
                    <span className="hidden w-28 text-sm text-ink-soft xl:block">{formatDate(d.updatedAt)}</span>
                    <span className="shrink-0">{actions(d)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((d) => (
                  <li key={d.id} className={`flex flex-col rounded border p-3 ${selected.has(d.id) ? 'border-primary-500 bg-mist/60' : 'border-line'}`}>
                    <div className="flex items-start gap-3">
                      <FileIcon kind={d.kind} />
                      <button type="button" onClick={() => setPreviewId(d.id)} className="min-w-0 flex-1 text-left">
                        <span className="line-clamp-2 break-words text-sm font-medium text-ink hover:underline">{d.name}</span>
                        <span className="mt-0.5 block text-xs text-muted">{formatSize(d.sizeKB)} · {relativeTime(d.updatedAt)}</span>
                      </button>
                      <input
                        type="checkbox"
                        checked={selected.has(d.id)}
                        onChange={() => toggle(d.id)}
                        aria-label={`Select ${d.name}`}
                        className="mt-1 h-4 w-4 shrink-0 accent-primary-600"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Badge tone={ACCESS_TONE[d.access]}>{ACCESS_LABEL[d.access]}</Badge>
                      {actions(d)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Pagination page={currentPage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
          </section>
        </div>
      </div>

      <Modal
        open={preview !== null}
        title={preview?.name ?? ''}
        description={preview ? `${KIND_LABEL[preview.kind]} · ${formatSize(preview.sizeKB)} · ${preview.category}` : ''}
        size="lg"
        onClose={() => {
          setPreviewId(null);
          setNewTag('');
        }}
        footer={
          preview ? (
            <>
              <button type="button" className="btn-outline text-danger-700" onClick={() => setToDelete([preview])}>
                <Trash2 size={16} aria-hidden="true" /> Delete
              </button>
              <button type="button" className="btn-outline" onClick={() => setArchived([preview], !preview.archived)}>
                {preview.archived ? <ArchiveRestore size={16} aria-hidden="true" /> : <Archive size={16} aria-hidden="true" />}
                {preview.archived ? 'Restore' : 'Archive'}
              </button>
              <button type="button" className="btn-outline" onClick={() => setShareId(preview.id)}>
                <Share2 size={16} aria-hidden="true" /> Share
              </button>
              <button type="button" className="btn-primary" onClick={() => download(preview)} disabled={!preview.fileUrl}>
                <Download size={16} aria-hidden="true" /> Download
              </button>
            </>
          ) : null
        }
      >
        {preview ? (
          <div className="space-y-5">
            <div className="flex min-h-[8rem] items-center justify-center rounded border border-line bg-paper p-4">
              {preview.kind === 'image' && preview.fileUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- blob: URLs from local uploads can't go through next/image
                <img src={preview.fileUrl} alt={`Preview of ${preview.name}`} className="max-h-64 object-contain" />
              ) : (
                <div className="text-center text-sm text-muted">
                  <FileIcon kind={preview.kind} size={22} />
                  <p className="mt-2">
                    {preview.fileUrl
                      ? 'Inline preview is available for images. Download the file to open it.'
                      : 'Sample document — there is no file content behind it in the demo.'}
                  </p>
                </div>
              )}
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">Owner</dt>
                <dd>{preview.owner}</dd>
              </div>
              <div>
                <dt className="text-muted">Uploaded</dt>
                <dd>{formatDate(preview.uploadedAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Access</dt>
                <dd>
                  <Badge tone={ACCESS_TONE[preview.access]}>{ACCESS_LABEL[preview.access]}</Badge>
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="mb-2 text-sm font-semibold">Tags</h3>
              <div className="flex flex-wrap items-center gap-2">
                {preview.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded bg-mist py-0.5 pl-2 pr-1 text-xs text-ink">
                    {t}
                    <button
                      type="button"
                      onClick={() => patch(preview.id, { tags: preview.tags.filter((x) => x !== t) })}
                      className="rounded p-0.5 hover:bg-primary-100"
                    >
                      <X size={12} aria-hidden="true" />
                      <span className="sr-only">Remove tag {t}</span>
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <label htmlFor="new-tag" className="sr-only">
                    New tag
                  </label>
                  <input
                    id="new-tag"
                    className="input-base w-32 py-1 text-xs"
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const t = newTag.trim().toLowerCase();
                        if (t && !preview.tags.includes(t)) patch(preview.id, { tags: [...preview.tags, t] });
                        setNewTag('');
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Version history</h3>
                <button type="button" className="btn-outline btn-sm" onClick={() => versionInput.current?.click()}>
                  <Upload size={14} aria-hidden="true" /> New version
                </button>
                <input
                  ref={versionInput}
                  type="file"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => {
                    uploadVersion(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>
              <ol className="divide-y divide-line rounded border border-line text-sm">
                {[...preview.versions].reverse().map((v, i) => (
                  <li key={v.version} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <span className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brass-text">v{v.version}</span>
                      <span>{v.note}</span>
                      {i === 0 ? <Badge tone="green">Current</Badge> : null}
                    </span>
                    <span className="text-xs text-muted">
                      {v.author} · {formatDateTime(v.date)}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={sharing !== null}
        title={sharing ? `Share “${sharing.name}”` : ''}
        onClose={() => {
          setShareId(null);
          setShareEmail('');
        }}
        footer={
          <button type="button" className="btn-primary" onClick={() => setShareId(null)}>
            Done
          </button>
        }
      >
        {sharing ? (
          <div className="space-y-5">
            <div>
              <p id="access-label" className="label">
                Who can open it
              </p>
              <div role="radiogroup" aria-labelledby="access-label" className="grid gap-2 sm:grid-cols-3">
                {(['private', 'team', 'organization'] as AccessLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={sharing.access === level}
                    onClick={() => {
                      patch(sharing.id, { access: level });
                      logAudit('Demo Admin', 'Changed document access', `${sharing.name} → ${ACCESS_LABEL[level]}`);
                      announce(`Access set to ${ACCESS_LABEL[level].toLowerCase()}.`);
                    }}
                    className={`rounded border p-3 text-left text-sm transition-colors duration-fast ${
                      sharing.access === level ? 'border-primary-600 bg-mist' : 'border-line hover:bg-paper'
                    }`}
                  >
                    <span className="block font-medium">{ACCESS_LABEL[level]}</span>
                    <span className="block text-xs text-muted">{ACCESS_HELP[level]}</span>
                  </button>
                ))}
              </div>
            </div>

            {sharing.access === 'team' ? (
              <fieldset>
                <legend className="label">Departments</legend>
                <div className="grid gap-1 sm:grid-cols-2">
                  {DEPARTMENTS.map((dept) => (
                    <label key={dept} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary-600"
                        checked={sharing.sharedWith.includes(dept)}
                        onChange={(e) =>
                          patch(sharing.id, {
                            sharedWith: e.target.checked ? [...sharing.sharedWith, dept] : sharing.sharedWith.filter((x) => x !== dept),
                          })
                        }
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div>
              <label htmlFor="share-email" className="label">
                Also share with a person{sharing.access === 'private' ? ' (choose Team or Organisation first)' : ''}
              </label>
              <div className="flex gap-2">
                <input
                  id="share-email"
                  type="email"
                  className="input-base"
                  placeholder="name@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-outline"
                  disabled={sharing.access === 'private' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shareEmail.trim())}
                  onClick={() => {
                    const email = shareEmail.trim().toLowerCase();
                    if (!sharing.sharedWith.includes(email)) patch(sharing.id, { sharedWith: [...sharing.sharedWith, email] });
                    logAudit('Demo Admin', 'Shared document', `${sharing.name} → ${email}`);
                    announce(`Shared with ${email}.`);
                    setShareEmail('');
                  }}
                >
                  Add
                </button>
              </div>
              {sharing.sharedWith.filter((s) => s.includes('@')).length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {sharing.sharedWith
                    .filter((s) => s.includes('@'))
                    .map((email) => (
                      <li key={email} className="inline-flex items-center gap-1 rounded bg-mist py-0.5 pl-2 pr-1 text-xs">
                        {email}
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-primary-100"
                          onClick={() => {
                            patch(sharing.id, { sharedWith: sharing.sharedWith.filter((x) => x !== email) });
                            logAudit('Demo Admin', 'Stopped sharing document', `${sharing.name} ← ${email}`);
                          }}
                        >
                          <X size={12} aria-hidden="true" />
                          <span className="sr-only">Stop sharing with {email}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              ) : null}
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={async () => {
                const link = `${window.location.origin}/documents`;
                try {
                  await navigator.clipboard.writeText(link);
                  announce('Link copied. People still need access to open it.');
                } catch {
                  announce(`Copy failed. The link is ${link}`);
                }
              }}
            >
              <Link2 size={16} aria-hidden="true" /> Copy link
            </button>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={toDelete !== null}
        title={toDelete && toDelete.length > 1 ? `Delete ${toDelete.length} documents?` : 'Delete document?'}
        message="Deleted documents and their version history can't be restored. Archive instead if you may need them later."
        confirmLabel="Delete"
        onConfirm={() => toDelete && remove(toDelete)}
        onClose={() => setToDelete(null)}
      />
    </AppShell>
  );
}
