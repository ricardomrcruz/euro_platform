import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './user.repository';
import { UserRole } from './enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

    async createUser(dto: CreateUserDto): Promise<UserResponseDto>{
        const existing = await this.userRepository.findByEmail(dto.email);
        if(existing){
            throw new ConflictException('Email already in use');
        }

        const user = this.userRepository.create({
            email: dto.email,
            password: bcrypt.hashSync(dto.password, 10),
            firstName: dto.firstName,
            lastName: dto.lastName,
            role: UserRole.CLIENT,
        })

        const saved = await this.userRepository.save(user);

        return this.toResponseDto(saved);
    }

    findByEmail(email:string): Promise<User|null>{
        return this.userRepository.findByEmail(email);
    }

    findById(id: number): Promise<User | null>{
        return this.userRepository.findById(id);
    }

    // "First L." style -- called server-to-server by euro-platform-api to show a bidder/
    // seller's identity without exposing a full name or email publicly.
    async getPublicNames(ids: number[]): Promise<Record<number, string>> {
        const users = await this.userRepository.findByIds(ids);
        const result: Record<number, string> = {};
        for (const user of users) {
            result[user.id] = `${user.firstName} ${user.lastName.charAt(0)}.`;
        }
        return result;
    }

    private toResponseDto(user: User): UserResponseDto{
        return{
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };
    }





}