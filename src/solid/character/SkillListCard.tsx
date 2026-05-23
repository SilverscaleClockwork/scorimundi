import type { SkillsStructure } from "@lib/global_types";
import { For } from "solid-js";
import type { SetStoreFunction } from "solid-js/store";

export default (props: {
    skills: SkillsStructure,
    setSkills: SetStoreFunction<SkillsStructure>,
}) => {
    return (
        <div class="card">
            <ul>
                <For each={Object.entries(props.skills)}>
                    {
                        ([key, skill]) => (
                            <li>
                                <div>
                                    {key}
                                </div>
                                <div>
                                    {skill.ability}
                                </div>
                                <div>
                                    {skill.proficiency}
                                </div>
                            </li>
                        )
                    }
                </For>
            </ul>
        </div>
    );
}