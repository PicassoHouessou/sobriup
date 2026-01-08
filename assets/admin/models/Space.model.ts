import {Zone} from "@Admin/models/Zone.model";

export interface Space {
    id: string;
    name: string;
    description: string;
    zone: Zone;
    floor: number;
    surface: number;
    createdAt: string;
    createdAtAgo: string;
}

export interface SpaceEdit {
    id: string;
    name: string;
    description: string;
    zone: string;
    floor: number;
    surface: number;
}
