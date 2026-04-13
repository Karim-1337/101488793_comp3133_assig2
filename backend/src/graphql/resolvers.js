const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const jwtSecret = () => process.env.JWT_SECRET || 'dev-secret';

function signToken(user) {
  return jwt.sign({ sub: user.id }, jwtSecret(), { expiresIn: '7d' });
}

function requireAuth(ctx) {
  if (!ctx.userId) {
    const err = new Error('Not authenticated');
    err.extensions = { code: 'UNAUTHENTICATED' };
    throw err;
  }
}

const resolvers = {
  User: {
    id: (u) => u.id || u._id?.toString(),
  },
  Employee: {
    id: (e) => e.id || e._id?.toString(),
  },
  Query: {
    me: async (_, __, ctx) => {
      if (!ctx.userId) return null;
      const u = await User.findById(ctx.userId).lean();
      return u ? mapUser(u) : null;
    },
    employees: async (_, { filter }, ctx) => {
      requireAuth(ctx);
      const q = {};
      if (filter?.department?.trim()) {
        q.department = new RegExp(filter.department.trim(), 'i');
      }
      if (filter?.position?.trim()) {
        q.position = new RegExp(filter.position.trim(), 'i');
      }
      const list = await Employee.find(q).sort({ createdAt: -1 }).lean();
      return list.map(mapEmployee);
    },
    employee: async (_, { id }, ctx) => {
      requireAuth(ctx);
      const e = await Employee.findById(id).lean();
      return e ? mapEmployee(e) : null;
    },
  },
  Mutation: {
    signup: async (_, { username, email, password }) => {
      if (!password || password.length < 6) {
        const err = new Error('Password must be at least 6 characters');
        err.extensions = { code: 'BAD_USER_INPUT' };
        throw err;
      }
      const passwordHash = await bcrypt.hash(password, 10);
      try {
        const user = await User.create({ username, email, passwordHash });
        return { token: signToken(user), user: mapUser(user.toObject()) };
      } catch (e) {
        if (e && e.code === 11000) {
          const err = new Error('Username or email is already registered');
          err.extensions = { code: 'BAD_USER_INPUT' };
          throw err;
        }
        throw e;
      }
    },
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        const err = new Error('Invalid email or password');
        err.extensions = { code: 'UNAUTHENTICATED' };
        throw err;
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        const err = new Error('Invalid email or password');
        err.extensions = { code: 'UNAUTHENTICATED' };
        throw err;
      }
      return { token: signToken(user), user: mapUser(user.toObject()) };
    },
    createEmployee: async (_, { input }, ctx) => {
      requireAuth(ctx);
      const e = await Employee.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        department: input.department || '',
        position: input.position || '',
        profilePictureUrl: input.profilePictureUrl || '',
      });
      return mapEmployee(e.toObject());
    },
    updateEmployee: async (_, { id, input }, ctx) => {
      requireAuth(ctx);
      const e = await Employee.findByIdAndUpdate(
        id,
        {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          department: input.department ?? '',
          position: input.position ?? '',
          profilePictureUrl: input.profilePictureUrl ?? '',
        },
        { new: true, runValidators: true }
      ).lean();
      if (!e) {
        const err = new Error('Employee not found');
        err.extensions = { code: 'NOT_FOUND' };
        throw err;
      }
      return mapEmployee(e);
    },
    deleteEmployee: async (_, { id }, ctx) => {
      requireAuth(ctx);
      const r = await Employee.findByIdAndDelete(id);
      return !!r;
    },
  },
};

function mapUser(u) {
  return {
    id: u._id.toString(),
    username: u.username,
    email: u.email,
  };
}

function mapEmployee(e) {
  return {
    id: e._id.toString(),
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    department: e.department || '',
    position: e.position || '',
    profilePictureUrl: e.profilePictureUrl || '',
    createdAt: e.createdAt ? e.createdAt.toISOString() : null,
    updatedAt: e.updatedAt ? e.updatedAt.toISOString() : null,
  };
}

module.exports = resolvers;
