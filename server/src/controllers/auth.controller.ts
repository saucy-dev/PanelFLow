import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Panel } from '../models/Panel.js';
import { Student } from '../models/Student.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
      if (!user || !user.passwordHash) {
        return ApiResponse.error(res, 'Invalid email or password', 401);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return ApiResponse.error(res, 'Invalid email or password', 401);
      }

      const token = signToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        panelId: user.panelId?.toString(),
        studentId: user.studentId?.toString(),
      });

      setAuthCookie(res, token);

      return ApiResponse.success(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            panelId: user.panelId,
            studentId: user.studentId,
          },
          token,
        },
        'Logged in successfully'
      );
    } catch (error: any) {
      console.error('AuthController.login error:', error);
      return ApiResponse.error(res, error.message || 'Login failed', 500);
    }
  }

  static async panelLogin(req: Request, res: Response) {
    try {
      const { panelCode } = req.body;

      const panel = await Panel.findOne({ panelCode: panelCode.toUpperCase() }).populate({
        path: 'interviewerIds',
        populate: { path: 'domains' },
      });

      if (!panel) {
        return ApiResponse.error(res, `Panel ${panelCode.toUpperCase()} not found`, 404);
      }

      let user = await User.findOne({ email: `panel-${panel.panelCode.toLowerCase()}@panelflow.local` });
      if (!user) {
        user = await User.create({
          name: `Panel ${panel.panelCode}`,
          email: `panel-${panel.panelCode.toLowerCase()}@panelflow.local`,
          role: 'PANEL',
          panelId: panel._id,
        });
      } else if (!user.panelId) {
        user.panelId = panel._id as any;
        await user.save();
      }

      const token = signToken({
        userId: user._id.toString(),
        role: 'PANEL',
        email: user.email,
        panelId: panel._id.toString(),
      });

      setAuthCookie(res, token);

      return ApiResponse.success(
        res,
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: 'PANEL',
            panelId: panel._id,
          },
          panel,
          token,
        },
        `Logged in as Panel ${panel.panelCode}`
      );
    } catch (error: any) {
      console.error('AuthController.panelLogin error:', error);
      return ApiResponse.error(res, error.message || 'Panel login failed', 500);
    }
  }

  static async me(req: Request, res: Response) {
    try {
      if (!req.user) {
        return ApiResponse.error(res, 'Not authenticated', 401);
      }

      const user = await User.findById(req.user.userId);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      let panelData = null;
      if (user.panelId) {
        panelData = await Panel.findById(user.panelId).populate({
          path: 'interviewerIds',
          populate: { path: 'domains' },
        });
      }

      return ApiResponse.success(res, {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          panelId: user.panelId,
          studentId: user.studentId,
        },
        panel: panelData,
      });
    } catch (error: any) {
      console.error('AuthController.me error:', error);
      return ApiResponse.error(res, error.message || 'Failed to fetch user session', 500);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      clearAuthCookie(res);
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error: any) {
      console.error('AuthController.logout error:', error);
      return ApiResponse.error(res, error.message || 'Logout failed', 500);
    }
  }
}
