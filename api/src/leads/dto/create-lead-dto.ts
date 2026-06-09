import { IsString } from "class-validator";

export class CreateLeadDto {
    @IsString()
    legalId!: string;

    @IsString()
    legalName!: string; 

    @IsString()
    website!: string; 
}
