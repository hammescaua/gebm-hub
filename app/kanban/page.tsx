"use client";

import { useState } from "react";
import { cardsData, columnsData } from "./dataObject";
import { DragDropManager } from '@dnd-kit/dom';

import { createDraggable } from './Draggable.js';
import { createDroppable } from './Droppable.js';

interface Props { }

/** 
 * Kanban Board
 * @param { Props } props
 * @returns { Element.JSX }
 */

export default function KanbanBoard(props: Props) {

    const [cards, setCards] = useState(cardsData);
    const [kanbans, setKanbans] = useState(columnsData);

    const manager = new DragDropManager();


    return (
        <>
            <div className="mt-8">
                <h1 className="text-gray-100 text-center text-4xl font-bold">
                    Kanban Board
                </h1>
            </div>
            <div className="mt-4 p-2 flex justify-between items-center">
                {kanbans.map((kanban) => (
                    <div
                        key={kanban.id}
                        className="bg-gray-100 w-full py-2 px-4 mr-2 h-80"
                    >
                        <div>
                            <h2 className="text-gray-900 text-center">
                                {kanban.text}
                            </h2>
                        </div>
                        <div className="mt-2 p-2 bg-gray-400 h-full overflow-auto">
                            {cards.map((c) => (
                                <>
                                    {kanban.id === c.column_id && (
                                        <div
                                            key={c.id}
                                            className="bg-gray-200 p-4 h-32 mb-2 rounded"
                                            draggable
                                        >
                                            <p>{c.title}</p>
                                        </div>
                                    )}
                                </>
                            ))}

                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}