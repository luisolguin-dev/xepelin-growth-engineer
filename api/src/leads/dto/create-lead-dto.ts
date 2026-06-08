import { IsString, IsUrl } from "class-validator";

export class CreateLeadDto {
    @IsString()
    legalId!: string;

    @IsString()
    legalName!: string; 

    @IsUrl()
    website!: string; 
}
