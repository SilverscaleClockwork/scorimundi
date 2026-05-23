import { createSignal, For } from "solid-js";
import { createStore } from "solid-js/store";

export default () => {
    const [notes, setNotes] = createStore([
        { title: "Background", content: "Born in the ashen wastes of the Cinderlands. Rose was found by a group of nomadic rogues who taught her how to survive in the heat." },
        { title: "Physicality", content: "Small of stature, skin like weathered slate, eyes that glow like dim embers." },
        { title: "Goal", content: "Find the Flame that never dies to bring light back to her clan." },
        { title: "Allies", content: "Kaelen the Smith, Mira of the High Ash." },
        { title: "Quests", content: "1. Retrieve the Cinderheart\n2. Escort the Caravan to Ashport" }
    ]);

    const [selectedIdx, setSelectedIdx] = createSignal(0);

    const activeNote = () => notes[selectedIdx()];

    return (
        <div class="notes-editor">
            <aside class="notes-sidebar">
                <ul class="notes-title-list">
                    <For each={notes}>
                        {(note, i) => (
                            <li 
                                class="note-title-item" 
                                classList={{ active: selectedIdx() === i() }}
                                onClick={() => setSelectedIdx(i())}
                            >
                                {note.title}
                            </li>
                        )}
                    </For>
                    <button class="add-note-btn">+ Add Note</button>
                </ul>
            </aside>
            
            <main class="note-main">
                <div class="note-edit-area">
                    <input 
                        type="text" 
                        class="note-title-input"
                        value={activeNote().title}
                        onInput={(e) => setNotes(selectedIdx(), 'title', e.currentTarget.value)}
                        placeholder="Note Title..."
                    />
                    <textarea 
                        class="note-content-input"
                        value={activeNote().content}
                        onInput={(e) => setNotes(selectedIdx(), 'content', e.currentTarget.value)}
                        placeholder="Start writing..."
                    ></textarea>
                </div>
            </main>
        </div>
    );
}
