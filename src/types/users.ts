import type { Response } from "./response";

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    status: boolean;
    createdAt: string;
}

export type UsersResponse = Response<User[]>