import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { PrismaClient } from "@prisma/client";
import { LoginDTO } from "../dto/Login.dto";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh'){
    constructor(private readonly prisma:PrismaClient, ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey:  process.env.JWT,
            passReqToCallback: true
        })
    }

    async validate(payload: {userId: LoginDTO}){
        const user = await this.prisma.user.findUnique({where:{email:payload.userId.email}})
        if(!user){
            throw new UnauthorizedException();
        }
        return user
    }
}