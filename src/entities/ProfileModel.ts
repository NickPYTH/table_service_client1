import {UserModel} from "entities/UserModel";
import {EmployeeModel} from "entities/EmployeeModel";

export type ProfileModel = {
    id: number;
    user: UserModel;
    employee: EmployeeModel;
}