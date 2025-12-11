export interface Module {
    id: string;
    name: string;
    description: string;
    type: ModuleType;
    createdAt: string;
    createdAtAgo: string;
}

export interface ModuleEdit {
    id: string;
    name: string;
    description: string;
    type: string;
}

export interface ModuleStatus {
    id: string;
    name: string;
    slug: string;
    color: string;
    description: string;
}

export interface ModuleType {
    id: string;
    name: string;
    description: string;
    unitOfMeasure: string;
    unitDescription: string;
    minValue: number;
    maxValue: number;
}

export interface ModuleHistory {
    id: string;
    module: Module;
    status: ModuleStatus;
    value: number;
    createdAt: string;
    createdAtAgo: string;
}
