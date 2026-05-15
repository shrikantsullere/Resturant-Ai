const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authModel = require('./auth.model');

class AuthService {
  async login(email, password) {
    const user = await authModel.findWithRole(email);
    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async updateProfile(userId, data) {
    if (!userId) throw new Error('User ID is required for profile update');
    
    const updateData = {};
    if (data.name) updateData.full_name = data.name;
    if (data.mobile) updateData.phone = data.mobile;
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid profile data provided for update');
    }

    const affectedRows = await authModel.update(userId, updateData);
    return { affectedRows };
  }
}

module.exports = new AuthService();
