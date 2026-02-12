import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductWithCostResponseDto } from './dto/product-with-cost-response.dto';
import { CreateProductCostDto } from './dto/create-product-cost.dto';
import { ProductCostResponseDto } from './dto/product-cost-response.dto';

@ApiTags('products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso',
    type: [ProductResponseDto],
  })
  findAll() {
    return this.productService.findAll();
  }

  @Get('with-cost')
  @ApiOperation({ summary: 'Listar todos os produtos com seus custos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos com custos retornada com sucesso',
    type: [ProductWithCostResponseDto],
  })
  findAllWithCost() {
    return this.productService.findAllProductsWithCost();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiParam({ name: 'id', description: 'ID do produto', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiParam({ name: 'id', description: 'ID do produto', type: 'string' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover produto' })
  @ApiParam({ name: 'id', description: 'ID do produto', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Produto removido com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  // Product Cost endpoints

  @Get('cost/all')
  @ApiOperation({ summary: 'Listar todos os custos de produto' })
  @ApiResponse({
    status: 200,
    description: 'Lista de custos retornada com sucesso',
    type: [ProductCostResponseDto],
  })
  findAllCosts() {
    return this.productService.findAllProductCosts();
  }

  @Post('cost')
  @ApiOperation({ summary: 'Criar um custo de produto' })
  @ApiBody({ type: CreateProductCostDto })
  @ApiResponse({
    status: 201,
    description: 'Custo criado com sucesso',
    type: ProductCostResponseDto,
  })
  createCost(@Body() createProductCostDto: CreateProductCostDto) {
    return this.productService.createProductCost(createProductCostDto);
  }

  @Patch('cost/:id')
  @ApiOperation({ summary: 'Atualizar custo de produto' })
  @ApiParam({ name: 'id', description: 'ID do custo', type: 'string' })
  @ApiBody({ type: CreateProductCostDto })
  @ApiResponse({
    status: 200,
    description: 'Custo atualizado com sucesso',
    type: ProductCostResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Custo não encontrado',
  })
  updateCost(
    @Param('id') id: string,
    @Body() updateProductCostDto: CreateProductCostDto,
  ) {
    return this.productService.updateProductCost(id, updateProductCostDto);
  }
}
