import React, { useState, useRef } from 'react';
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  Plus,
  FolderPlus,
  Trash2,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import { FileNode } from '@/types/ide';
import { cn } from '@/lib/utils';
import { LANGUAGE_MAP, FILE_ICONS } from '@/constants/defaultFiles';

interface FileExplorerProps {
  fileTree: FileNode[];
  selectedFileId: string | null;
  onFileOpen: (fileId: string) => void;
  onFolderToggle: (folderId: string) => void;
  onCreateFile: (parentId: string | null, name: string) => void;
  onCreateFolder: (parentId: string | null, name: string) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
}

function getFileIcon(node: FileNode): string {
  if (node.type === 'folder') return node.isOpen ? '📂' : '📁';
  const ext = node.name.split('.').pop()?.toLowerCase() ?? '';
  const lang = LANGUAGE_MAP[ext] ?? 'plaintext';
  return FILE_ICONS[lang] ?? '📄';
}

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  selectedFileId: string | null;
  onFileOpen: (fileId: string) => void;
  onFolderToggle: (folderId: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onCreate: (parentId: string, type: 'file' | 'folder') => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  depth,
  selectedFileId,
  onFileOpen,
  onFolderToggle,
  onDelete,
  onRename,
  onCreate,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [showActions, setShowActions] = useState(false);
  const renameRef = useRef<HTMLInputElement>(null);

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== node.name) {
      onRename(node.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleClick = () => {
    if (node.type === 'folder') {
      onFolderToggle(node.id);
    } else {
      onFileOpen(node.id);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'file-tree-item group relative',
          selectedFileId === node.id && node.type === 'file' && 'file-tree-item-active'
        )}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={handleClick}
      >
        {/* Expand icon for folders */}
        {node.type === 'folder' ? (
          <span className="text-muted-foreground shrink-0 w-3">
            {node.isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        ) : (
          <span className="w-3 shrink-0" />
        )}

        {/* File icon */}
        <span className="text-xs shrink-0">{getFileIcon(node)}</span>

        {/* Name or rename input */}
        {isRenaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            className="flex-1 bg-[hsl(220_13%_20%)] text-foreground text-xs px-1 rounded outline-none border border-primary"
            onClick={e => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className="flex-1 text-xs truncate">{node.name}</span>
        )}

        {/* Action buttons */}
        {showActions && !isRenaming && (
          <div
            className="flex items-center gap-0.5 absolute right-1"
            onClick={e => e.stopPropagation()}
          >
            {node.type === 'folder' && (
              <>
                <button
                  title="New File"
                  className="p-0.5 rounded hover:bg-[hsl(220_13%_25%)] text-muted-foreground hover:text-foreground"
                  onClick={() => onCreate(node.id, 'file')}
                >
                  <Plus size={11} />
                </button>
                <button
                  title="New Folder"
                  className="p-0.5 rounded hover:bg-[hsl(220_13%_25%)] text-muted-foreground hover:text-foreground"
                  onClick={() => onCreate(node.id, 'folder')}
                >
                  <FolderPlus size={11} />
                </button>
              </>
            )}
            <button
              title="Rename"
              className="p-0.5 rounded hover:bg-[hsl(220_13%_25%)] text-muted-foreground hover:text-foreground"
              onClick={() => { setIsRenaming(true); setRenameValue(node.name); }}
            >
              <Edit3 size={11} />
            </button>
            <button
              title="Delete"
              className="p-0.5 rounded hover:bg-red-900 text-muted-foreground hover:text-red-400"
              onClick={() => onDelete(node.id)}
            >
              <Trash2 size={11} />
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {node.type === 'folder' && node.isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedFileId={selectedFileId}
              onFileOpen={onFileOpen}
              onFolderToggle={onFolderToggle}
              onDelete={onDelete}
              onRename={onRename}
              onCreate={onCreate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  fileTree,
  selectedFileId,
  onFileOpen,
  onFolderToggle,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
}) => {
  const [creatingIn, setCreatingIn] = useState<{ parentId: string | null; type: 'file' | 'folder' } | null>(null);
  const [newName, setNewName] = useState('');

  const handleCreate = (parentId: string | null, type: 'file' | 'folder') => {
    setCreatingIn({ parentId, type });
    setNewName(type === 'file' ? 'untitled.ts' : 'new-folder');
  };

  const submitCreate = () => {
    if (!newName.trim() || !creatingIn) return;
    if (creatingIn.type === 'file') {
      const node = onCreateFile(creatingIn.parentId, newName.trim());
      if (node) onFileOpen(node.id);
    } else {
      onCreateFolder(creatingIn.parentId, newName.trim());
    }
    setCreatingIn(null);
    setNewName('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--ide-panel-border))]">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explorer</span>
        <div className="flex items-center gap-1">
          <button
            title="New File"
            className="p-1 rounded hover:bg-[hsl(220_13%_18%)] text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleCreate(null, 'file')}
          >
            <Plus size={13} />
          </button>
          <button
            title="New Folder"
            className="p-1 rounded hover:bg-[hsl(220_13%_18%)] text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleCreate(null, 'folder')}
          >
            <FolderPlus size={13} />
          </button>
          <button
            title="Refresh"
            className="p-1 rounded hover:bg-[hsl(220_13%_18%)] text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Project Label */}
      <div className="px-3 py-1.5 border-b border-[hsl(var(--ide-panel-border))]">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">MY-APP</span>
      </div>

      {/* Inline create input */}
      {creatingIn && !creatingIn.parentId && (
        <div className="flex items-center gap-1.5 px-3 py-1">
          <span className="text-xs">{creatingIn.type === 'file' ? '📄' : '📁'}</span>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onBlur={submitCreate}
            onKeyDown={e => {
              if (e.key === 'Enter') submitCreate();
              if (e.key === 'Escape') setCreatingIn(null);
            }}
            className="flex-1 bg-[hsl(220_13%_20%)] text-foreground text-xs px-1 py-0.5 rounded outline-none border border-primary"
            autoFocus
          />
        </div>
      )}

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {fileTree.map(node => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selectedFileId={selectedFileId}
            onFileOpen={onFileOpen}
            onFolderToggle={onFolderToggle}
            onDelete={onDeleteFile}
            onRename={onRenameFile}
            onCreate={handleCreate}
          />
        ))}
      </div>
    </div>
  );
};
