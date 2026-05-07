import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AutoComplete, Button, Spin, Tree, message } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { useQueryClient } from '@tanstack/react-query';

type Org = {
  brNo: string;
  brName: string;
};

type User = {
  jkwNo: string;
  jkwName: string;
  brNo: string;
  brName?: string;
};

type NodeType = 'ORG' | 'USER';

type TreeNode = DataNode & {
  nodeType: NodeType;
  brNo?: string;
  jkwNo?: string;
};

type UserOption = {
  value: string;
  label: string;
  jkwNo: string;
  jkwName: string;
  brNo: string;
  brName?: string;
};

const makeOrgKey = (brNo: string | number) => `ORG_${String(brNo).trim()}`;
const makeUserKey = (jkwNo: string | number) => `USER_${String(jkwNo).trim()}`;

/**
 * mock 조직 목록
 */
const MOCK_ORGS: Org[] = Array.from({ length: 600 }).map((_, i) => {
  const brNo = String(100000 + i);

  return {
    brNo,
    brName: `조직 ${i + 1}`,
  };
});

/**
 * mock 사용자 목록
 */
const MOCK_USERS: User[] = MOCK_ORGS.flatMap((org, orgIndex) => {
  const total = 20 + (orgIndex % 11) * 20; // 20, 40, 60 ... 220

  return Array.from({ length: total }).map((_, userIndex) => {
    const no = userIndex + 1;

    return {
      jkwNo: `${org.brNo}-${String(no).padStart(4, '0')}`,
      jkwName: `사용자 ${String(no).padStart(4, '0')} (${org.brName})`,
      brNo: org.brNo,
      brName: org.brName,
    };
  });
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiFetchOrgRoots(): Promise<Org[]> {
  await sleep(200);
  return MOCK_ORGS;
}

async function apiFetchOrgUsers(brNo: string): Promise<User[]> {
  await sleep(300);
  return MOCK_USERS.filter((user) => user.brNo === brNo);
}

async function apiSearchUsers(keyword: string): Promise<User[]> {
  await sleep(200);

  const lowerKeyword = keyword.toLowerCase();

  return MOCK_USERS.filter((user) => {
    return (
      user.jkwName.toLowerCase().includes(lowerKeyword) ||
      user.jkwNo.toLowerCase().includes(lowerKeyword) ||
      user.brName?.toLowerCase().includes(lowerKeyword) ||
      user.brNo.toLowerCase().includes(lowerKeyword)
    );
  }).slice(0, 50);
}

function orgToNode(org: Org): TreeNode {
  return {
    key: makeOrgKey(org.brNo),
    title: org.brName,
    nodeType: 'ORG',
    brNo: org.brNo,
    isLeaf: false,
    checkable: false,
  };
}

function userToNode(user: User): TreeNode {
  return {
    key: makeUserKey(user.jkwNo),
    title: user.jkwName,
    nodeType: 'USER',
    jkwNo: user.jkwNo,
    brNo: user.brNo,
    isLeaf: true,
  };
}

function updateTreeData(list: TreeNode[], key: React.Key, children: TreeNode[]): TreeNode[] {
  return list.map((node) => {
    if (node.key === key) {
      return {
        ...node,
        children,
      };
    }

    if (node.children?.length) {
      return {
        ...node,
        children: updateTreeData(node.children as TreeNode[], key, children),
      };
    }

    return node;
  });
}

function findTreeNode(list: TreeNode[], key: React.Key): TreeNode | undefined {
  for (const node of list) {
    if (node.key === key) {
      return node;
    }

    if (node.children?.length) {
      const found = findTreeNode(node.children as TreeNode[], key);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

function hasTreeKey(list: TreeNode[], key: React.Key): boolean {
  return findTreeNode(list, key) !== undefined;
}

export default function ControlledExpandTree() {
  const queryClient = useQueryClient();

  const treeRef = useRef<any>(null);

  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedUserKeys, setCheckedUserKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const [pendingFocusKey, setPendingFocusKey] = useState<React.Key | null>(null);

  const treeDataRef = useRef<TreeNode[]>([]);
  const loadingOrgRef = useRef<Set<string>>(new Set());
  const searchSeqRef = useRef(0);

  const height = 520;
  const itemHeight = 28;

  useEffect(() => {
    treeDataRef.current = treeData;
  }, [treeData]);

  useEffect(() => {
    (async () => {
      try {
        const orgs = await apiFetchOrgRoots();
        setTreeData(orgs.map(orgToNode));
      } catch (e) {
        message.error('조직 조회 실패');
      }
    })();
  }, []);

  const fetchOrgUsers = useCallback(
    (brNo: string) =>
      queryClient.fetchQuery<User[]>({
        queryKey: ['OrgUsers', brNo],
        queryFn: () => apiFetchOrgUsers(brNo),
        staleTime: 10 * 60 * 1000,
      }),
    [queryClient],
  );

  const loadOrgUser = useCallback(
    async (brNo: string, orgKey: React.Key) => {
      const orgNode = findTreeNode(treeDataRef.current, orgKey);

      if (orgNode?.children?.length) {
        return;
      }

      if (loadingOrgRef.current.has(brNo)) {
        return;
      }

      loadingOrgRef.current.add(brNo);

      try {
        const users = await fetchOrgUsers(brNo);
        const children = users.map(userToNode);

        setTreeData((prev) => {
          const next = updateTreeData(prev, orgKey, children);
          treeDataRef.current = next;
          return next;
        });
      } catch (e) {
        message.error('사용자 조회 실패');
      } finally {
        loadingOrgRef.current.delete(brNo);
      }
    },
    [fetchOrgUsers],
  );

  useEffect(() => {
    if (pendingFocusKey == null) {
      return;
    }

    if (!hasTreeKey(treeData, pendingFocusKey)) {
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSelectedKeys([pendingFocusKey]);

        treeRef.current?.scrollTo?.({
          key: pendingFocusKey,
          align: 'top',
        });

        setPendingFocusKey(null);
      });
    });
  }, [treeData, pendingFocusKey]);

  const onExpand: TreeProps['onExpand'] = useCallback(
    async (nextExpandedKeys, info) => {
      setExpandedKeys(nextExpandedKeys);

      if (!info.expanded) {
        return;
      }

      const node = info.node as unknown as TreeNode;

      if (node.nodeType !== 'ORG') {
        return;
      }

      if (!node.brNo) {
        return;
      }

      await loadOrgUser(node.brNo, node.key);
    },
    [loadOrgUser],
  );

  const onCheck: TreeProps['onCheck'] = useCallback((checkedKeys) => {
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;

    setCheckedUserKeys(keys.filter((key) => String(key).startsWith('USER_')));
  }, []);

  const handleSearchUser = useCallback(async (keyword: string) => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setUserOptions([]);
      return;
    }

    const seq = searchSeqRef.current + 1;
    searchSeqRef.current = seq;

    setUserSearchLoading(true);

    try {
      const users = await apiSearchUsers(trimmedKeyword);

      if (searchSeqRef.current !== seq) {
        return;
      }

      setUserOptions(
        users.map((user) => ({
          value: user.jkwNo,
          label: `${user.jkwName} / ${user.brName ?? user.brNo}`,
          jkwNo: user.jkwNo,
          jkwName: user.jkwName,
          brNo: user.brNo,
          brName: user.brName,
        })),
      );
    } catch (e) {
      message.error('사용자 검색 실패');
    } finally {
      if (searchSeqRef.current === seq) {
        setUserSearchLoading(false);
      }
    }
  }, []);

  const handleSelectUser = useCallback(
    async (_value: string, option: UserOption) => {
      const orgKey = makeOrgKey(option.brNo);
      const userKey = makeUserKey(option.jkwNo);

      setExpandedKeys((prev) => {
        if (prev.includes(orgKey)) {
          return prev;
        }

        return [...prev, orgKey];
      });

      await loadOrgUser(option.brNo, orgKey);

      setPendingFocusKey(userKey);
    },
    [loadOrgUser],
  );

  const expandAllOrgs = useCallback(() => {
    const orgKeys = treeData.filter((node) => String(node.key).startsWith('ORG_')).map((node) => node.key);

    setExpandedKeys(orgKeys);
  }, [treeData]);

  const collapseAll = useCallback(() => {
    setExpandedKeys([]);
    setSelectedKeys([]);
    setPendingFocusKey(null);
  }, []);

  return (
    <div className="org-user-tree-wrap" style={{ border: '1px solid #eee', padding: 8 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Button onClick={expandAllOrgs}>조직 전부 펼치기</Button>
        <Button onClick={collapseAll}>전부 접기</Button>
        <span style={{ color: '#888' }}>체크: {checkedUserKeys.length}명</span>
      </div>

      <Tree
        ref={treeRef}
        checkable
        checkStrictly
        treeData={treeData}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        onExpand={onExpand}
        onCheck={onCheck}
        onSelect={(keys) => setSelectedKeys(keys)}
        checkedKeys={checkedUserKeys}
        virtual
        height={height}
        itemHeight={itemHeight}
      />

      <div style={{ marginTop: 8 }}>
        <AutoComplete
          style={{ width: '100%' }}
          options={userOptions}
          placeholder="사용자 검색 예: 100554-0030"
          onSearch={handleSearchUser}
          onSelect={handleSelectUser}
          notFoundContent={userSearchLoading ? <Spin size="small" /> : null}
          allowClear
        />
      </div>
    </div>
  );
}
