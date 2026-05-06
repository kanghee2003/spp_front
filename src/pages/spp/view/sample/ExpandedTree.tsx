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
const MOCK_ORGS: Org[] = Array.from({ length: 20 }).map((_, i) => ({
  brNo: String(1000 + i),
  brName: `조직 ${i + 1}`,
}));

/**
 * mock 사용자 목록
 * 조직별 0~200명 생성
 */
const MOCK_USERS: User[] = MOCK_ORGS.flatMap((org) => {
  const total = (Number(org.brNo) % 5) * 50; // 0, 50, 100, 150, 200

  return Array.from({ length: total }).map((_, userIndex) => ({
    jkwNo: `${org.brNo}-${userIndex + 1}`,
    jkwName: `사용자 ${userIndex + 1} (${org.brName})`,
    brNo: org.brNo,
    brName: org.brName,
  }));
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * mock 조직 조회
 */
async function apiFetchOrgRoots(): Promise<Org[]> {
  await sleep(200);
  return MOCK_ORGS;
}

/**
 * mock 조직별 사용자 조회
 *
 * 실제 구조에서는 expand 시 axios 호출하는 부분.
 */
async function apiFetchOrgUsers(brNo: string): Promise<User[]> {
  await sleep(300);
  return MOCK_USERS.filter((user) => user.brNo === brNo);
}

/**
 * mock 사용자 자동완성 검색
 */
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
  }).slice(0, 30);
}

function orgToNode(org: Org): TreeNode {
  return {
    key: makeOrgKey(org.brNo),
    title: org.brName,
    nodeType: 'ORG',
    brNo: org.brNo,
    isLeaf: false,

    // 조직은 체크박스 숨김
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

    if (node.children) {
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
  return !!findTreeNode(list, key);
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

  /**
   * 자동완성 선택 후 이동할 사용자 key
   *
   * ref 대신 state로 관리해서 undefined 타이밍 문제를 줄임
   */
  const [pendingFocusKey, setPendingFocusKey] = useState<React.Key | null>(null);

  // 최신 treeData 참조용
  const treeDataRef = useRef<TreeNode[]>([]);

  // 중복 expand 로딩 방지
  const loadingOrgRef = useRef<Set<string>>(new Set());

  // 자동완성 검색 race 방지
  const searchSeqRef = useRef(0);

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

  /**
   * 조직의 사용자 children이 없으면 조회해서 treeData에 붙임
   *
   * - Tree expand 시 사용
   * - 사용자 자동완성 선택 시 사용
   */
  const loadOrgUser = useCallback(
    async (brNo: string, orgKey: React.Key) => {
      const latestTreeData = treeDataRef.current;
      const orgNode = findTreeNode(latestTreeData, orgKey);

      // 이미 사용자 children이 있으면 다시 조회하지 않음
      if (orgNode?.children?.length) {
        return;
      }

      // 이미 같은 조직을 로딩 중이면 중복 호출하지 않음
      if (loadingOrgRef.current.has(brNo)) {
        return;
      }

      loadingOrgRef.current.add(brNo);

      try {
        const users = await fetchOrgUsers(brNo);
        const children = users.map(userToNode);

        setTreeData((prev) => {
          const next = updateTreeData(prev, orgKey, children);

          // 바로 다음 로직에서 최신 treeData를 볼 수 있도록 같이 갱신
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

  /**
   * treeData에 검색한 사용자가 실제로 붙은 뒤 scrollTo 처리
   */
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
          align: 'center',
        });

        setPendingFocusKey(null);
      });
    });
  }, [treeData, expandedKeys, pendingFocusKey]);

  /**
   * Tree expand 시 조직 사용자 조회
   */
  const onExpand: TreeProps['onExpand'] = useCallback(
    async (nextExpandedKeys, info) => {
      setExpandedKeys(nextExpandedKeys);

      // 접는 경우에는 사용자 조회 안 함
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

  /**
   * USER만 체크
   */
  const onCheck: TreeProps['onCheck'] = useCallback((checkedKeys) => {
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;

    setCheckedUserKeys(keys.filter((key) => String(key).startsWith('USER_')));
  }, []);

  /**
   * 자동완성 사용자 검색
   */
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

      // 늦게 끝난 이전 검색 결과 무시
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

  /**
   * AutoComplete 사용자 선택 후 처리
   *
   * 1. 해당 조직 expand
   * 2. 조직 사용자 조회
   * 3. 해당 사용자로 scroll 이동
   */
  const handleSelectUser = useCallback(
    async (_value: string, option: UserOption) => {
      const selectedUser: User = {
        jkwNo: option.jkwNo,
        jkwName: option.jkwName,
        brNo: option.brNo,
        brName: option.brName,
      };

      if (!selectedUser.brNo || !selectedUser.jkwNo) {
        message.warning('선택한 사용자 정보가 올바르지 않습니다.');
        return;
      }

      const orgKey = makeOrgKey(selectedUser.brNo);
      const userKey = makeUserKey(selectedUser.jkwNo);

      // 1. 해당 사용자로 이동 예약
      setPendingFocusKey(userKey);

      // 2. 해당 조직 expand
      setExpandedKeys((prev) => {
        if (prev.includes(orgKey)) {
          return prev;
        }

        return [...prev, orgKey];
      });

      // 3. expand 시와 동일하게 사용자 조회
      await loadOrgUser(selectedUser.brNo, orgKey);
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

  const height = 520;

  return (
    <div style={{ border: '1px solid #eee', padding: 8 }}>
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
        itemHeight={24}
      />

      <div style={{ marginTop: 8 }}>
        <AutoComplete
          style={{ width: '100%' }}
          options={userOptions}
          placeholder="사용자 검색"
          onSearch={handleSearchUser}
          onSelect={handleSelectUser}
          notFoundContent={userSearchLoading ? <Spin size="small" /> : null}
          allowClear
        />
      </div>
    </div>
  );
}
