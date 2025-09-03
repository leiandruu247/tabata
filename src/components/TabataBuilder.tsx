import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Tree } from "@dnd-kit/tree";
import { TabataItem, Exercise, Combo, isCombo } from "../types/tabata";
import styles from "./TabataBuilder.module.css";
import { MdDragIndicator, MdDelete } from "react-icons/md";
import TabataTimer from "./TabataTimer";

function toTreeItems(items: TabataItem[], parentId: string | null = null): any {
  return items.reduce((acc, item) => {
    acc[item.id] = {
      id: item.id,
      parentId,
      children: isCombo(item) ? item.children.map(child => child.id) : [],
      data: item,
    };
    if (isCombo(item)) {
      Object.assign(acc, toTreeItems(item.children, item.id));
    }
    return acc;
  }, {} as any);
}

function fromTreeItems(tree: any, rootIds: string[]): TabataItem[] {
  return rootIds.map(id => {
    const node = tree[id];
    if (!node) return null;
    if (isCombo(node.data)) {
      return {
        ...node.data,
        children: fromTreeItems(tree, node.children),
      };
    }
    return node.data;
  }).filter(Boolean) as TabataItem[];
}

const TabataBuilder: React.FC = () => {
  const [tabataList, setTabataList] = useState<TabataItem[]>([]);
  const [tree, setTree] = useState<any>({});
  const [rootIds, setRootIds] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(false);

  React.useEffect(() => {
    setTree(toTreeItems(tabataList));
    setRootIds(tabataList.map(item => item.id));
  }, [tabataList]);

  const addExercise = () => {
    const exercise: Exercise = {
      id: uuidv4(),
      type: "exercise",
      name: "",
      duration: 20,
      rest: 10,
      repetitions: 1,
    };
    setTabataList([...tabataList, exercise]);
  };

  const addCombo = () => {
    const combo: Combo = {
      id: uuidv4(),
      type: "combo",
      name: "Novo Combo",
      children: [],
      repetitions: 1,
    };
    setTabataList([...tabataList, combo]);
  };

  function handleEditItem(item: TabataItem, parentId: string | null) {
    function edit(items: TabataItem[]): TabataItem[] {
      return items.map(child => {
        if (child.id === item.id) return item;
        if (isCombo(child)) {
          return { ...child, children: edit(child.children) };
        }
        return child;
      });
    }
    setTabataList(edit(tabataList));
  }

  function handleRemoveItem(id: string, parentId: string | null) {
    function remove(items: TabataItem[]): TabataItem[] {
      return items
        .filter(child => child.id !== id)
        .map(child =>
          isCombo(child) ? { ...child, children: remove(child.children) } : child
        );
    }
    setTabataList(remove(tabataList));
  }

  function handleTreeChange(newTree: any, newRootIds: string[]) {
    setTree(newTree);
    setRootIds(newRootIds);
    setTabataList(fromTreeItems(newTree, newRootIds));
  }

  return (
    <div>
      {!showTimer && (
        <div className={styles.tabataContainer}>
          <div className={styles.header}>
            <img src="https://img.icons8.com/ios-filled/50/4885fa/timer.png" alt="Tabata" width={28} />
            <h2 style={{ margin: 0, fontWeight: 700, color: "#233263" }}>Tabata Builder</h2>
          </div>
          <Tree
            tree={tree}
            rootIds={rootIds}
            render={(node: any, { depth, isDragging }: any) => (
              <div
                className={`${styles.itemCard} ${isDragging ? styles.dragging : ""}`}
                style={{ marginLeft: depth * 18 }}
              >
                <span className={styles.dragHandle}><MdDragIndicator /></span>
                {isCombo(node.data) ? (
                  <div>
                    <div className={styles.comboHeader}>
                      <b>Combo:</b>
                      <input
                        type="text"
                        value={node.data.name}
                        onChange={e =>
                          handleEditItem({ ...node.data, name: e.target.value }, node.parentId)
                        }
                      />
                      <span>x</span>
                      <input
                        type="number"
                        min={1}
                        value={node.data.repetitions}
                        onChange={e =>
                          handleEditItem(
                            { ...node.data, repetitions: Number(e.target.value) },
                            node.parentId
                          )
                        }
                      />
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveItem(node.id, node.parentId)}
                        title="Remover combo"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.exerciseFields}>
                    <input
                      type="text"
                      value={node.data.name}
                      placeholder="Nome do exercício"
                      onChange={e =>
                        handleEditItem({ ...node.data, name: e.target.value }, node.parentId)
                      }
                    />
                    <span>Duração</span>
                    <input
                      type="number"
                      min={1}
                      value={node.data.duration}
                      onChange={e =>
                        handleEditItem({ ...node.data, duration: Number(e.target.value) }, node.parentId)
                      }
                    />
                    <span>s</span>
                    <span>Intervalo</span>
                    <input
                      type="number"
                      min={0}
                      value={node.data.rest}
                      onChange={e =>
                        handleEditItem({ ...node.data, rest: Number(e.target.value) }, node.parentId)
                      }
                    />
                    <span>s</span>
                    <span>x</span>
                    <input
                      type="number"
                      min={1}
                      value={node.data.repetitions}
                      onChange={e =>
                        handleEditItem(
                          { ...node.data, repetitions: Number(e.target.value) },
                          node.parentId
                        )
                      }
                    />
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveItem(node.id, node.parentId)}
                      title="Remover exercício"
                    >
                      <MdDelete />
                    </button>
                  </div>
                )}
              </div>
            )}
            onChange={handleTreeChange}
            dragPreviewRender={node => (
              <div style={{
                padding: 10,
                borderRadius: 8,
                background: "#f5fafd",
                border: "1.5px solid #4885fa",
                minWidth: 140,
              }}>
                {node.data.name || (isCombo(node.data) ? "Combo" : "Exercício")}
              </div>
            )}
            canDrop={() => true}
          />
          <div className={styles.addButtons}>
            <button onClick={addExercise} style={{
              background: "#4885fa",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 18px",
              fontWeight: 600,
              cursor: "pointer"
            }}>
              + Exercício
            </button>
            <button onClick={addCombo} style={{
              background: "#fff",
              color: "#4885fa",
              border: "1.5px solid #4885fa",
              borderRadius: 6,
              padding: "10px 18px",
              fontWeight: 600,
              cursor: "pointer"
            }}>
              + Combo
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button
              style={{
                background: "#15bb5b",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "12px 28px",
                fontWeight: 700,
                fontSize: "1.12em",
                cursor: "pointer",
                marginTop: 6,
                boxShadow: "0 2px 10px rgba(21,187,91,0.08)"
              }}
              disabled={tabataList.length === 0}
              onClick={() => setShowTimer(true)}
            >
              Iniciar Tabata Timer
            </button>
          </div>
        </div>
      )}
      {showTimer && (
        <TabataTimer
          sequence={tabataList}
          onBack={() => setShowTimer(false)}
        />
      )}
    </div>
  );
};

export default TabataBuilder;
