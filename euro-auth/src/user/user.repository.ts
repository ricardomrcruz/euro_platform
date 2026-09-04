import { Injectable } from "@nestjs/common";
import { DataSource, In, Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UserRepository extends Repository<User>{
    constructor(private readonly dataSource: DataSource){
        super(User, dataSource.createEntityManager());
    }

    findByEmail(email:string): Promise <User|null> {
        return this.findOneBy({ email });
    }

    findById(id: number): Promise<User | null> {
        return this.findOneBy({ id });
    }

    findByIds(ids: number[]): Promise<User[]> {
        return this.findBy({ id: In(ids) });
    }
}