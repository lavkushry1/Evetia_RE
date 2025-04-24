import { Request, Response } from 'express';
import { Settings } from '../models/settings.model';
import { Op } from 'sequelize';

export class SettingsController {
  // Get all settings
  async getAllSettings(req: Request, res: Response) {
    try {
      const settings = await Settings.findAll();
      
      // Convert array of settings to an object for easier access
      const settingsObject = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      return res.status(200).json(settingsObject);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({ message: 'Failed to fetch settings' });
    }
  }

  // Get settings by key
  async getSettingsByKey(req: Request, res: Response) {
    try {
      const { key } = req.params;
      
      const setting = await Settings.findOne({
        where: { key }
      });
      
      if (!setting) {
        return res.status(404).json({ message: 'Setting not found' });
      }
      
      return res.status(200).json({ [key]: setting.value });
    } catch (error) {
      console.error('Error fetching setting:', error);
      return res.status(500).json({ message: 'Failed to fetch setting' });
    }
  }

  // Get payment settings
  async getPaymentSettings(req: Request, res: Response) {
    try {
      const paymentSettings = await Settings.findAll({
        where: {
          key: {
            [Op.in]: ['upiVpa', 'merchantName', 'paymentInstructions']
          }
        }
      });
      
      // Convert array of settings to an object
      const settingsObject = paymentSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);
      
      // Add default values if not found
      if (!settingsObject.upiVpa) settingsObject.upiVpa = 'eventia@okicici';
      if (!settingsObject.merchantName) settingsObject.merchantName = 'Eventia';
      if (!settingsObject.paymentInstructions) settingsObject.paymentInstructions = 'Scan the QR code with any UPI app to make the payment.';
      
      return res.status(200).json(settingsObject);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      return res.status(500).json({ message: 'Failed to fetch payment settings' });
    }
  }

  // Update settings
  async updateSettings(req: Request, res: Response) {
    try {
      const { key, value, description } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ message: 'Key and value are required' });
      }
      
      const [setting, created] = await Settings.findOrCreate({
        where: { key },
        defaults: { value, description }
      });
      
      if (!created) {
        await setting.update({ key, value, description });
      }
      
      return res.status(200).json({ message: 'Setting updated successfully', setting });
    } catch (error) {
      console.error('Error updating setting:', error);
      return res.status(500).json({ message: 'Failed to update setting' });
    }
  }

  // Update payment settings
  async updatePaymentSettings(req: Request, res: Response) {
    try {
      const { upiVpa, merchantName, paymentInstructions } = req.body;
      
      const updates = [];
      
      if (upiVpa !== undefined) {
        updates.push(
          Settings.upsert({ key: 'upiVpa', value: upiVpa })
        );
      }
      
      if (merchantName !== undefined) {
        updates.push(
          Settings.upsert({ key: 'merchantName', value: merchantName })
        );
      }
      
      if (paymentInstructions !== undefined) {
        updates.push(
          Settings.upsert({ key: 'paymentInstructions', value: paymentInstructions })
        );
      }
      
      await Promise.all(updates);
      
      return res.status(200).json({ message: 'Payment settings updated successfully' });
    } catch (error) {
      console.error('Error updating payment settings:', error);
      return res.status(500).json({ message: 'Failed to update payment settings' });
    }
  }
} 