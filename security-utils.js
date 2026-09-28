/**
 * 物业端安全性增强工具
 * 包含：数据加密、权限管理、XSS防护、敏感信息脱敏
 */
(function (global) {
  'use strict';

  var SecurityUtils = {
    KEY_PREFIX: 'sgzf_sec_',

    encrypt: function (data, key) {
      try {
        var str = typeof data === 'string' ? data : JSON.stringify(data);
        var encoded = btoa(encodeURIComponent(str));
        var shifted = '';
        var k = key || 'default_key';
        for (var i = 0; i < encoded.length; i++) {
          var charCode = encoded.charCodeAt(i);
          var keyChar = k.charCodeAt(i % k.length);
          shifted += String.fromCharCode(charCode ^ (keyChar % 256));
        }
        return btoa(shifted);
      } catch (e) {
        console.error('Encryption error:', e);
        return null;
      }
    },

    decrypt: function (encrypted, key) {
      try {
        var k = key || 'default_key';
        var shifted = atob(encrypted);
        var encoded = '';
        for (var i = 0; i < shifted.length; i++) {
          var charCode = shifted.charCodeAt(i);
          var keyChar = k.charCodeAt(i % k.length);
          encoded += String.fromCharCode(charCode ^ (keyChar % 256));
        }
        var decoded = decodeURIComponent(atob(encoded));
        try {
          return JSON.parse(decoded);
        } catch (e) {
          return decoded;
        }
      } catch (e) {
        console.error('Decryption error:', e);
        return null;
      }
    },

    maskPhone: function (phone) {
      if (!phone || phone === '—') return '—';
      var cleaned = String(phone).replace(/\D/g, '');
      if (cleaned.length >= 7) {
        return cleaned.slice(0, 3) + '****' + cleaned.slice(-4);
      }
      return phone;
    },

    maskIdCard: function (idCard) {
      if (!idCard || idCard === '—') return '—';
      var cleaned = String(idCard).replace(/\s/g, '');
      if (cleaned.length >= 15) {
        return cleaned.slice(0, 6) + '********' + cleaned.slice(-4);
      }
      return idCard;
    },

    maskName: function (name) {
      if (!name || name === '—') return '—';
      var str = String(name);
      if (str.length <= 1) return str;
      if (str.length === 2) return str[0] + '*';
      return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
    },

    sanitizeHtml: function (html) {
      if (!html) return '';
      var div = document.createElement('div');
      div.textContent = html;
      return div.innerHTML;
    },

    sanitizeInput: function (input) {
      if (!input) return '';
      return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    },

    escapeRegex: function (str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    validatePhone: function (phone) {
      if (!phone) return false;
      var cleaned = String(phone).replace(/\D/g, '');
      return /^1[3-9]\d{9}$/.test(cleaned);
    },

    validateIdCard: function (idCard) {
      if (!idCard) return false;
      var cleaned = String(idCard).replace(/\s/g, '');
      return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(cleaned);
    },

    validateEmail: function (email) {
      if (!email) return false;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
    },

    generateToken: function (length) {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var token = '';
      var len = length || 32;
      for (var i = 0; i < len; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return token;
    },

    hashString: function (str) {
      var hash = 0;
      var s = String(str);
      if (s.length === 0) return hash;
      for (var i = 0; i < s.length; i++) {
        var char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    }
  };

  var PermissionManager = {
    roles: {
      admin: {
        name: '管理员',
        permissions: ['*']
      },
      manager: {
        name: '主管',
        permissions: ['tickets.*', 'owners.*', 'assets.*', 'bulletin.*', 'staff.view']
      },
      staff: {
        name: '普通员工',
        permissions: ['tickets.view', 'tickets.edit', 'owners.view', 'assets.view']
      },
      viewer: {
        name: '访客',
        permissions: ['tickets.view', 'owners.view']
      }
    },

    currentUser: null,

    init: function (userRole) {
      this.currentUser = {
        role: userRole || 'staff',
        permissions: this.getRolePermissions(userRole || 'staff')
      };
    },

    getRolePermissions: function (role) {
      var roleData = this.roles[role];
      if (!roleData) return [];
      return roleData.permissions;
    },

    hasPermission: function (permission) {
      if (!this.currentUser) return false;
      var permissions = this.currentUser.permissions;
      if (permissions.indexOf('*') !== -1) return true;
      if (permissions.indexOf(permission) !== -1) return true;
      var parts = permission.split('.');
      for (var i = 0; i < parts.length; i++) {
        var wildcard = parts.slice(0, i + 1).join('.') + '.*';
        if (permissions.indexOf(wildcard) !== -1) return true;
      }
      return false;
    },

    checkPermission: function (permission, callback) {
      var hasAccess = this.hasPermission(permission);
      if (callback) {
        callback(hasAccess);
      }
      return hasAccess;
    },

    requirePermission: function (permission) {
      if (!this.hasPermission(permission)) {
        throw new Error('Permission denied: ' + permission);
      }
    },

    filterByPermission: function (items, permissionKey) {
      var self = this;
      return items.filter(function (item) {
        var permission = item[permissionKey];
        if (!permission) return true;
        return self.hasPermission(permission);
      });
    },

    hideUnauthorizedElements: function () {
      var self = this;
      document.querySelectorAll('[data-permission]').forEach(function (el) {
        var permission = el.getAttribute('data-permission');
        if (!self.hasPermission(permission)) {
          el.style.display = 'none';
        }
      });
    },

    getCurrentUser: function () {
      return this.currentUser;
    },

    setCurrentUser: function (role) {
      this.init(role);
      this.hideUnauthorizedElements();
    }
  };

  var DataProtection = {
    sensitiveFields: ['phone', 'idCard', 'bankAccount', 'password'],

    protectData: function (data, fields) {
      var fieldsToMask = fields || this.sensitiveFields;
      var protected = JSON.parse(JSON.stringify(data));
      
      if (Array.isArray(protected)) {
        protected = protected.map(function (item) {
          return this.maskSensitiveFields(item, fieldsToMask);
        }, this);
      } else if (typeof protected === 'object') {
        protected = this.maskSensitiveFields(protected, fieldsToMask);
      }
      
      return protected;
    },

    maskSensitiveFields: function (obj, fields) {
      var result = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (fields.indexOf(key) !== -1) {
            if (key === 'phone' || key.indexOf('Phone') !== -1) {
              result[key] = SecurityUtils.maskPhone(obj[key]);
            } else if (key === 'idCard' || key.indexOf('IdCard') !== -1) {
              result[key] = SecurityUtils.maskIdCard(obj[key]);
            } else if (key === 'name' || key.indexOf('Name') !== -1) {
              result[key] = SecurityUtils.maskName(obj[key]);
            } else {
              result[key] = '******';
            }
          } else {
            result[key] = obj[key];
          }
        }
      }
      return result;
    },

    encryptForStorage: function (data, key) {
      return SecurityUtils.encrypt(data, key);
    },

    decryptFromStorage: function (encrypted, key) {
      return SecurityUtils.decrypt(encrypted, key);
    }
  };

  var AuditLog = {
    logs: [],
    maxLogs: 1000,

    log: function (action, details, user) {
      var entry = {
        id: 'LOG-' + Date.now(),
        action: action,
        details: details,
        user: user || 'system',
        timestamp: new Date().toISOString(),
        ip: this.getClientIP()
      };
      
      this.logs.unshift(entry);
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(0, this.maxLogs);
      }
      
      return entry;
    },

    getClientIP: function () {
      return 'client-side';
    },

    getLogs: function (filter) {
      if (!filter) return this.logs;
      
      return this.logs.filter(function (log) {
        var match = true;
        if (filter.action && log.action !== filter.action) match = false;
        if (filter.user && log.user !== filter.user) match = false;
        if (filter.startDate && new Date(log.timestamp) < new Date(filter.startDate)) match = false;
        if (filter.endDate && new Date(log.timestamp) > new Date(filter.endDate)) match = false;
        return match;
      });
    },

    exportLogs: function (format) {
      var data = this.logs;
      if (format === 'csv') {
        var csv = 'ID,操作,详情,用户,时间\n';
        data.forEach(function (log) {
          csv += log.id + ',' + log.action + ',' + SecurityUtils.sanitizeInput(log.details) + ',' + log.user + ',' + log.timestamp + '\n';
        });
        return csv;
      }
      return JSON.stringify(data, null, 2);
    }
  };

  global.SecurityUtils = SecurityUtils;
  global.PermissionManager = PermissionManager;
  global.DataProtection = DataProtection;
  global.AuditLog = AuditLog;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      SecurityUtils: SecurityUtils,
      PermissionManager: PermissionManager,
      DataProtection: DataProtection,
      AuditLog: AuditLog
    };
  }
})(typeof window !== 'undefined' ? window : this);
