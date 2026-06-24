import React, { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Tree, message } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { useQueryClient } from '@tanstack/react-query';
import PdfCanvasPreview from '../../../../shared/component/Viewer/PdfCanvasPreview';

/** ===== 타입 ===== */
type Dept = { deptId: string; deptName: string; hasChildren?: boolean };
type User = { userId: string; userName: string; deptId: string };

type NodeType = 'DEPT' | 'USER';

type TreeNode = DataNode & {
  nodeType: NodeType;
  deptId?: string;
  userId?: string;
};

/** ===== 유틸: 특정 노드 children 교체 ===== */
function updateTreeData(list: TreeNode[], key: React.Key, children: TreeNode[]): TreeNode[] {
  return list.map((node) => {
    if (node.key === key) return { ...node, children };
    if (node.children) return { ...node, children: updateTreeData(node.children as TreeNode[], key, children) };
    return node;
  });
}

/** ===== API 예시 (너희 API로 교체) ===== */
async function apiFetchDeptRoots(): Promise<Dept[]> {
  // return Sample1Api().getDeptRoots();
  return Array.from({ length: 600 }).map((_, i) => ({
    deptId: String(1000 + i),
    deptName: `부서 ${i + 1}`,
    hasChildren: false,
  }));
}

async function apiFetchDeptUsers(deptId: string): Promise<User[]> {
  // return Sample1Api().getDeptUsers(deptId);
  // 데모: 부서마다 0~200명 정도
  const total = (Number(deptId) % 5) * 50; // 0,50,100,150,200
  await new Promise((r) => setTimeout(r, 150));
  return Array.from({ length: total }).map((_, i) => ({
    userId: `${deptId}-${i + 1}`,
    userName: `사용자 ${i + 1} (${deptId})`,
    deptId,
  }));
}

/** ===== 노드 생성 ===== */
function deptToNode(d: Dept): TreeNode {
  return {
    key: `DEPT:${d.deptId}`,
    title: d.deptName,
    nodeType: 'DEPT',
    deptId: d.deptId,
    isLeaf: false,

    // ✅ 부서 체크박스 숨김
    checkable: false,

    // (선택 여부는 자유. 부서 클릭해서 펼치게 하고 싶으면 true)
    selectable: true,
  };
}

function userToNode(u: User): TreeNode {
  return {
    key: `USER:${u.userId}`,
    title: u.userName,
    nodeType: 'USER',
    userId: u.userId,
    isLeaf: true,

    // 사용자 체크박스는 기본 true라 생략 가능하지만 명시해둠
    checkable: true,
    selectable: true,
  };
}

/** ===== 메인 ===== */
export default function DeptUserPickerTree() {
  const queryClient = useQueryClient();

  // 오른쪽 트리 데이터
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  // 오른쪽 트리에서 체크된 사용자 키(USER:xxx)
  const [checkedUserKeys, setCheckedUserKeys] = useState<React.Key[]>([]);

  // 왼쪽으로 이동된(확정) 사용자 목록
  const [pickedUsers, setPickedUsers] = useState<User[]>([]);

  // loadData에서 받은 사용자 정보를 왼쪽에 정확히 넣기 위한 캐시
  const userCacheRef = React.useRef<Map<string, User>>(new Map());

  /** 초기 부서 로딩 */
  useEffect(() => {
    (async () => {
      const depts = await apiFetchDeptRoots();
      setTreeData(depts.map(deptToNode));
    })().catch(() => message.error('부서 조회 실패'));
  }, []);

  /** fetchQuery 스타일(호출형) */
  const fetchDeptUsers = useCallback(
    (deptId: string) => {
      return queryClient.fetchQuery<User[]>({
        queryKey: ['DeptUsers', deptId],
        queryFn: () => apiFetchDeptUsers(deptId),
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      });
    },
    [queryClient],
  );

  /** 부서 expand 시 사용자 children 주입 */
  const loadData: TreeProps['loadData'] = useCallback(
    async (rawNode: any) => {
      const node = rawNode as TreeNode;

      // USER는 load 없음
      if (node.nodeType === 'USER') return;

      // 이미 로딩된 부서는 재호출 방지
      if (node.nodeType === 'DEPT' && node.children) return;

      const deptId = node.deptId!;
      try {
        const users = await fetchDeptUsers(deptId);

        // 왼쪽 이동 시 이름 정확히 넣기 위해 캐시에 저장
        users.forEach((u) => userCacheRef.current.set(u.userId, u));

        const children = users.map(userToNode);

        // ✅ expand 순간 렌더를 부드럽게(옵션)
        startTransition(() => {
          setTreeData((prev) => updateTreeData(prev, node.key, children));
        });
      } catch (e) {
        message.error('사용자 조회 실패');
        throw e; // Tree 로딩 표시 위해 throw 권장
      }
    },
    [fetchDeptUsers],
  );

  /** USER만 체크 반영 (checkStrictly 대응) */
  const onCheck: TreeProps['onCheck'] = useCallback((checkedKeys: any) => {
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
    const onlyUsers = keys.filter((k: any) => String(k).startsWith('USER:'));
    setCheckedUserKeys(onlyUsers);
  }, []);

  /** 오른쪽 체크 사용자 -> 왼쪽 리스트로 추가 */
  const moveLeft = useCallback(() => {
    if (checkedUserKeys.length === 0) return;

    const addUsers: User[] = checkedUserKeys
      .map((k) => String(k).replace('USER:', ''))
      .map((userId) => {
        const cached = userCacheRef.current.get(userId);
        if (cached) return cached;

        // 혹시 캐시에 없으면(이론상 거의 없음) 최소 정보로라도
        const [deptId] = userId.split('-');
        return { userId, userName: userId, deptId };
      });

    setPickedUsers((prev) => {
      const map = new Map(prev.map((u) => [u.userId, u]));
      addUsers.forEach((u) => map.set(u.userId, u));
      return Array.from(map.values());
    });

    setCheckedUserKeys([]);
  }, [checkedUserKeys]);

  const removePicked = useCallback((userId: string) => {
    setPickedUsers((prev) => prev.filter((u) => u.userId !== userId));
  }, []);

  const rightTreeHeight = 520;

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {/* 왼쪽: 선택된 사용자 목록 */}
      <div style={{ width: 360, border: '1px solid #eee', padding: 8 }}>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <b>선택된 사용자</b>
          <span>{pickedUsers.length}명</span>
        </div>

        <div style={{ maxHeight: rightTreeHeight, overflow: 'auto' }}>
          {pickedUsers.map((u) => (
            <div
              key={u.userId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                padding: '6px 0',
                borderBottom: '1px dashed #f0f0f0',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.userName}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{u.deptId}</div>
              </div>

              <Button size="small" onClick={() => removePicked(u.userId)}>
                제거
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* 가운데: 이동 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={moveLeft} disabled={checkedUserKeys.length === 0}>
          &lt; 추가
        </Button>
      </div>

      {/* 오른쪽: 부서/사용자 트리 */}
      <div style={{ flex: 1, border: '1px solid #eee', padding: 8 }}>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <b>부서/사용자</b>
          <span style={{ color: '#888' }}>체크된 사용자: {checkedUserKeys.length}명</span>
        </div>

        <Tree
          checkable
          checkStrictly
          treeData={treeData}
          loadData={loadData}
          onCheck={onCheck}
          checkedKeys={checkedUserKeys}
          virtual
          height={rightTreeHeight} // ✅ 필수
          itemHeight={24} // ✅ 대략 한 행 높이
        />
      </div>
    </div>
  );
}
