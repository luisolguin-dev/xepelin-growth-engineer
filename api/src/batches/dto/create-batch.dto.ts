import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEmail, IsString, IsUrl, ValidateNested } from "class-validator";
import { CreateLeadDto } from "../../leads/dto/create-lead-dto";



export class CreateBatchDto {
    @IsString()
    name!: string; 

    @IsString()
    segment!: string; 

    @IsEmail()
    ownerEmail!: string; 

    @IsUrl()
    webhookUrl!: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateLeadDto)
    leads!: CreateLeadDto[];

}