import { useState, useCallback } from 'react';
import { FileNode, Tab } from '@/types/ide';
import { DEFAULT_WORKSPACE, LANGUAGE_MAP } from '@/constants/defaultFiles';
import { generateId } from '@/lib/utils';

function getLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return LANGUAGE_MAP[ext] ?? 'plaintext';
}

function findNode(nodes: FileNode[], id: string): FileNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateNodeContent(nodes: FileNode[], id: string, content: string): FileNode[] {
  return nodes.map(node => {
    if (node.id === id) return { ...node, content };
    if (node.children) return { ...node, children: updateNodeContent(node.children, id, content) };
    return node;
  });
}

function toggleFolder(nodes: FileNode[], id: string): FileNode[] {
  return nodes.map(node => {
    if (node.id === id) return { ...node, isOpen: !node.isOpen };
    if (node.children) return { ...node, children: toggleFolder(node.children, id) };
    return node;
  });
}

function addNodeToParent(nodes: FileNode[], parentId: string | null, newNode: FileNode): FileNode[] {
  if (!parentId) return [...nodes, newNode];
  return nodes.map(node => {
    if (node.id === parentId && node.type === 'folder') {
      return { ...node, isOpen: true, children: [...(node.children ?? []), newNode] };
    }
    if (node.children) return { ...node, children: addNodeToParent(node.children, parentId, newNode) };
    return node;
  });
}

function deleteNode(nodes: FileNode[], id: string): FileNode[] {
  return nodes
    .filter(node => node.id !== id)
    .map(node => {
      if (node.children) return { ...node, children: deleteNode(node.children, id) };
      return node;
    });
}

function renameNode(nodes: FileNode[], id: string, newName: string): FileNode[] {
  return nodes.map(node => {
    if (node.id === id) {
      const newPath = node.path.replace(/[^/]+$/, newName);
      return { ...node, name: newName, path: newPath, language: getLanguage(newName) };
    }
    if (node.children) return { ...node, children: renameNode(node.children, id, newName) };
    return node;
  });
}

export function useFileSystem() {
  const [fileTree, setFileTree] = useState<FileNode[]>(DEFAULT_WORKSPACE);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const openFile = useCallback((fileId: string) => {
    const node = findNode(fileTree, fileId);
    if (!node || node.type !== 'file') return;

    const existing = tabs.find(t => t.fileId === fileId);
    if (existing) {
      setActiveTabId(existing.id);
      setSelectedFileId(fileId);
      return;
    }

    const newTab: Tab = {
      id: generateId(),
      fileId: node.id,
      fileName: node.name,
      filePath: node.path,
      content: node.content ?? '',
      isDirty: false,
      language: node.language ?? getLanguage(node.name),
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setSelectedFileId(fileId);
  }, [fileTree, tabs]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId);
      const next = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        const newActive = next[Math.max(0, idx - 1)];
        setActiveTabId(newActive?.id ?? null);
        setSelectedFileId(newActive?.fileId ?? null);
      }
      return next;
    });
  }, [activeTabId]);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, content, isDirty: true } : t));
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setFileTree(prev => updateNodeContent(prev, tab.fileId, content));
    }
  }, [tabs]);

  const saveTab = useCallback((tabId: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, isDirty: false } : t));
  }, []);

  const toggleFolderOpen = useCallback((folderId: string) => {
    setFileTree(prev => toggleFolder(prev, folderId));
  }, []);

  const createFile = useCallback((parentId: string | null, name: string) => {
    const newNode: FileNode = {
      id: generateId(),
      name,
      type: 'file',
      path: `/${name}`,
      language: getLanguage(name),
      content: '',
    };
    setFileTree(prev => addNodeToParent(prev, parentId, newNode));
    return newNode;
  }, []);

  const createFolder = useCallback((parentId: string | null, name: string) => {
    const newNode: FileNode = {
      id: generateId(),
      name,
      type: 'folder',
      path: `/${name}`,
      isOpen: true,
      children: [],
    };
    setFileTree(prev => addNodeToParent(prev, parentId, newNode));
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    setTabs(prev => prev.filter(t => t.fileId !== fileId));
    if (selectedFileId === fileId) setSelectedFileId(null);
    setFileTree(prev => deleteNode(prev, fileId));
  }, [selectedFileId]);

  const renameFile = useCallback((fileId: string, newName: string) => {
    setFileTree(prev => renameNode(prev, fileId, newName));
    setTabs(prev => prev.map(t =>
      t.fileId === fileId
        ? { ...t, fileName: newName, language: getLanguage(newName) }
        : t
    ));
  }, []);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  return {
    fileTree,
    tabs,
    activeTab,
    activeTabId,
    selectedFileId,
    openFile,
    closeTab,
    updateTabContent,
    saveTab,
    toggleFolderOpen,
    createFile,
    createFolder,
    deleteFile,
    renameFile,
    setActiveTabId,
    setSelectedFileId,
  };
}
