import type { NextFunction, Request, Response } from "express";
import { categoryService } from "./category.service";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query
    );

    const result = await categoryService.getAllCategories({
      search: searchString,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await categoryService.getCategoryById(id as string);

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await categoryService.updateCategory(id as string, req.body);

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await categoryService.deleteCategory(id as string);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const categoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};