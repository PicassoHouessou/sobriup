export interface Log {
    id: string;
    error: boolean;
    level: number;
    levelName: string;
    clientIp: string;
    clientPort: string;
    method: string;
    queryString: string | null;
    request: any;
    uri: string;
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userRoles: Array<string>;
    createdAt: string;
    userId: number;
    IP: string;
    action: string;
}
