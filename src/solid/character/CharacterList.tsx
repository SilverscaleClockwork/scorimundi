import { createSignal, onMount, For, Show } from "solid-js";
import { auth } from "../../lib/auth";
import { client } from "../../lib/api";

export default () => {
    const [characters, setCharacters] = createSignal<any[]>([]);
    const [loading, setLoading] = createSignal(true);
    const [error, setError] = createSignal('');
    
    const [showCreate, setShowCreate] = createSignal(false);
    const handledRaces = [
        "Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Orc", "Tiefling"
    ];
    const [newName, setNewName] = createSignal('');
    const [newRace, setNewRace] = createSignal(handledRaces[0]);
    const [deletingId, setDeletingId] = createSignal<string | null>(null);

    const fetchCharacters = async () => {
        if (!auth.token()) {
            setLoading(false);
            return;
        }

        try {
            const res = await client.characters.$get({
                header: { 'Authorization': `Bearer ${auth.token()}` }
            });
            const data = await res.json() as any;
            if (res.ok) {
                setCharacters(data.characters);
            } else {
                setError(data.error || 'Failed to fetch characters');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: Event) => {
        e.preventDefault();
        setError('');
        try {
            const res = await client.characters.$post({
                header: { 'Authorization': `Bearer ${auth.token()}` },
                json: { name: newName(), race: newRace() }
            });
            const data = await res.json() as any;
            if (res.ok) {
                setCharacters([...characters(), data.character]);
                setShowCreate(false);
                setNewName('');
                setNewRace(handledRaces[0]);
            } else {
                setError(data.error || 'Failed to create character');
            }
        } catch (err) {
            setError('Failed to create character');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to return this hero to the ashes? This cannot be undone.')) return;
        
        setDeletingId(id);
        setError('');
        try {
            const res = await client.characters[":id"].$delete({
                param: { id },
                header: { 'Authorization': `Bearer ${auth.token()}` }
            });
            
            if (res.ok) {
                setCharacters(characters().filter(c => c.id !== id));
            } else {
                const data = await res.json() as any;
                setError(data.error || 'Failed to delete character');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setDeletingId(null);
        }
    };

    onMount(() => {
        fetchCharacters();
    });

    return (
        <div class="character-list-container">
            <header class="list-header">
                <h1>Your Heroes</h1>
                <button class="scori-btn btn-small" onClick={() => setShowCreate(true)}>
                    + New Hero
                </button>
            </header>

            <Show when={showCreate()}>
                <div class="card create-character-card">
                    <h3>Forge a New Destiny</h3>
                    <form onSubmit={handleCreate}>
                        <div class="scori-input-group-vertical">
                            <label>Name</label>
                            <input 
                                type="text" 
                                class="scori-input" 
                                value={newName()} 
                                onInput={(e) => setNewName(e.currentTarget.value)}
                                placeholder="Hero Name"
                                required
                            />
                        </div>
                        <div class="scori-input-group-vertical">
                            <label>Race</label>
                            <select 
                                class="scori-input" 
                                value={newRace()} 
                                onChange={(e) => setNewRace(e.currentTarget.value)}
                                required
                            >
                                <For each={handledRaces}>
                                    {(race) => <option value={race}>{race}</option>}
                                </For>
                            </select>
                        </div>
                        <Show when={error()}>
                            <p class="auth-error">{error()}</p>
                        </Show>
                        <div class="modal-actions">
                            <button type="submit" class="scori-btn">Create</button>
                            <button type="button" class="scori-btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            </Show>

            <div class="character-grid">
                <Show when={loading()}>
                    <p class="status-msg">Searching the ashes...</p>
                </Show>

                <Show when={!loading() && characters().length === 0}>
                    <div class="empty-state">
                        <p>No heroes have risen yet.</p>
                        <button class="scori-btn" onClick={() => setShowCreate(true)}>Ignite a New Flame</button>
                    </div>
                </Show>

                <For each={characters()}>
                    {(char) => (
                        <div class="character-card-wrapper">
                            <a href={`/character/sheet?id=${char.id}`} class="card character-card-link">
                                <div class="char-header">
                                    <h3>{char.name}</h3>
                                    <span class="char-race-tag">{char.race}</span>
                                </div>
                                <div class="char-hp-summary">
                                    <label>HP</label>
                                    <span>{char.hpCurr} / {char.hpMax}</span>
                                </div>
                            </a>
                            <button 
                                class="delete-char-btn" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(char.id);
                                }}
                                disabled={deletingId() === char.id}
                                title="Delete Hero"
                            >
                                <Show when={deletingId() === char.id} fallback="×">
                                    ...
                                </Show>
                            </button>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
};
