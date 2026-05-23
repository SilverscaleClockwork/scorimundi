import { createSignal, For, onCleanup, createEffect, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { client } from "../../lib/api";
import { auth } from "../../lib/auth";
import { debounce } from "es-toolkit";

export default (props: { initialNotes?: any[], characterId?: string }) => {
    const [notes, setNotes] = createStore<any[]>([]);
    const [selectedIdx, setSelectedIdx] = createSignal(0);
    const [isSaving, setIsSaving] = createSignal(false);

    // Sync internal store with props when they change
    createEffect(() => {
        if (props.initialNotes && props.initialNotes.length > 0) {
            setNotes(JSON.parse(JSON.stringify(props.initialNotes)));
        } else {
            setNotes([{ id: 'temp', title: "New Note", content: "" }]);
        }
    });

    const activeNote = () => notes[selectedIdx()] || notes[0];

    const saveNote = async (idx: number) => {
        const note = notes[idx];
        if (!note || !note.id || note.id === 'temp' || !auth.token()) return;

        setIsSaving(true);
        try {
            const res = await client.notes[":id"].$patch({
                param: { id: note.id.toString() },
                header: { 'Authorization': `Bearer ${auth.token()}` },
                json: { title: note.title, content: note.content }
            });
            
            if (!res.ok) {
                console.error('Save failed on server');
            }
        } catch (err) {
            console.error('Network error during auto-save:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const debouncedSave = debounce(saveNote, 1000);

    onCleanup(() => {
        debouncedSave.cancel();
    });

    const handleAddNote = async () => {
        if (!props.characterId || !auth.token()) return;

        try {
            const res = await client.characters[":id"].notes.$post({
                param: { id: props.characterId },
                header: { 'Authorization': `Bearer ${auth.token()}` },
                json: { title: 'New Note', content: '' }
            });
            
            const data = await res.json() as any;
            if (res.ok) {
                setNotes(produce(state => {
                    if (state.length === 1 && state[0].id === 'temp') {
                        state[0] = data.note;
                    } else {
                        state.push(data.note);
                    }
                }));
                setSelectedIdx(notes.length - 1);
            }
        } catch (err) {
            console.error('Network error during note creation:', err);
        }
    };

    const handleDeleteNote = async (e: Event, id: any, idx: number) => {
        e.stopPropagation();
        if (id === 'temp') return;
        if (!confirm('Are you sure you want to delete this note?')) return;

        try {
            const res = await client.notes[":id"].$delete({
                param: { id: id.toString() },
                header: { 'Authorization': `Bearer ${auth.token()}` }
            });

            if (res.ok) {
                setNotes(produce(state => {
                    state.splice(idx, 1);
                }));
                if (selectedIdx() >= notes.length) {
                    setSelectedIdx(Math.max(0, notes.length - 1));
                }
            }
        } catch (err) {
            console.error('Failed to delete note', err);
        }
    };

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
                                <span class="title-text">{note.title || 'Untitled'}</span>
                                <Show when={note.id !== 'temp' && notes.length > 1}>
                                    <button 
                                        class="delete-note-btn" 
                                        onClick={(e) => handleDeleteNote(e, note.id, i())}
                                        title="Delete Note"
                                    >
                                        ×
                                    </button>
                                </Show>
                            </li>
                        )}
                    </For>
                    <button class="add-note-btn" onClick={handleAddNote}>+ Add Note</button>
                </ul>
            </aside>
            
            <main class="note-main">
                <div class="note-edit-area">
                    <div class="save-indicator">
                        <Show when={activeNote()?.id !== 'temp'}>
                            {isSaving() ? 'Saving...' : 'All changes saved'}
                        </Show>
                        <Show when={activeNote()?.id === 'temp'}>
                            <em>Draft (Click + Add Note to save)</em>
                        </Show>
                    </div>
                    <input 
                        type="text" 
                        class="note-title-input"
                        value={activeNote()?.title || ''}
                        onInput={(e) => {
                            setNotes(selectedIdx(), 'title', e.currentTarget.value);
                            if (activeNote().id !== 'temp') debouncedSave(selectedIdx());
                        }}
                        placeholder="Note Title..."
                    />
                    <textarea 
                        class="note-content-input"
                        value={activeNote()?.content || ''}
                        onInput={(e) => {
                            setNotes(selectedIdx(), 'content', e.currentTarget.value);
                            if (activeNote().id !== 'temp') debouncedSave(selectedIdx());
                        }}
                        placeholder="Start writing..."
                    ></textarea>
                </div>
            </main>
        </div>
    );
}
