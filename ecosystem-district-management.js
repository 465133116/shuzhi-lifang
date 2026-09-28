/**
 * 数治理方 - 社区多小区管理模块
 * 支持多小区数据的集中化管理，包括基本信息、物业管理、配置信息等
 */
(function (global) {
  'use strict';
  var PREFIX = 'sgzf_';
  var storage = typeof localStorage !== 'undefined' ? localStorage : null;

  function key(k) { return PREFIX + k; }
  function get(k) {
    if (!storage) return null;
    try {
      var raw = storage.getItem(key(k));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function set(k, v) {
    if (!storage) return;
    try {
      storage.setItem(key(k), JSON.stringify(v));
    } catch (e) {}
  }

  /**
   * 小区基本信息数据模型
   */
  function getDistricts() {
    var list = get('districts');
    if (list && Array.isArray(list)) return list;
    seedDistricts();
    return get('districts');
  }
  function setDistricts(list) {
    set('districts', Array.isArray(list) ? list : []);
  }
  function addDistrict(district) {
    var list = getDistricts().slice();
    if (!district.id) {
      district.id = 'district_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }
    district.createTime = district.createTime || new Date().toISOString();
    district.updateTime = district.createTime;
    district.status = district.status || 'active';
    district.version = 1;
    list.unshift(district);
    setDistricts(list);
    return district;
  }
  function updateDistrict(id, patch) {
    var list = getDistricts().slice();
    var i = list.findIndex(function (d) { return d.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].updateTime = new Date().toISOString();
    list[i].version = (list[i].version || 1) + 1;
    setDistricts(list);
    return list[i];
  }
  function deleteDistrict(id) {
    var list = getDistricts().slice();
    var i = list.findIndex(function (d) { return d.id === id; });
    if (i === -1) return false;
    list.splice(i, 1);
    setDistricts(list);
    return true;
  }
  function findDistrict(id) {
    return getDistricts().find(function(d) { return d.id === id; }) || null;
  }

  /**
   * 小区物业管理信息数据模型
   */
  function getPropertyManagement() {
    var list = get('property_management');
    if (list && Array.isArray(list)) return list;
    return [];
  }
  function setPropertyManagement(list) {
    set('property_management', Array.isArray(list) ? list : []);
  }
  function addPropertyManagement(property) {
    var list = getPropertyManagement().slice();
    if (!property.id) {
      property.id = 'property_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }
    property.createTime = property.createTime || new Date().toISOString();
    property.updateTime = property.createTime;
    property.status = property.status || 'active';
    list.unshift(property);
    setPropertyManagement(list);
    return property;
  }
  function updatePropertyManagement(id, patch) {
    var list = getPropertyManagement().slice();
    var i = list.findIndex(function (p) { return p.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].updateTime = new Date().toISOString();
    setPropertyManagement(list);
    return list[i];
  }
  function findPropertyManagement(districtId) {
    return getPropertyManagement().find(function(p) { return p.districtId === districtId; }) || null;
  }

  /**
   * 小区配置信息数据模型
   */
  function getDistrictConfigurations() {
    var list = get('district_configurations');
    if (list && Array.isArray(list)) return list;
    return [];
  }
  function setDistrictConfigurations(list) {
    set('district_configurations', Array.isArray(list) ? list : []);
  }
  function addDistrictConfiguration(config) {
    var list = getDistrictConfigurations().slice();
    if (!config.id) {
      config.id = 'config_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }
    config.createTime = config.createTime || new Date().toISOString();
    config.updateTime = config.createTime;
    config.status = config.status || 'active';
    list.unshift(config);
    setDistrictConfigurations(list);
    return config;
  }
  function updateDistrictConfiguration(id, patch) {
    var list = getDistrictConfigurations().slice();
    var i = list.findIndex(function (c) { return c.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].updateTime = new Date().toISOString();
    setDistrictConfigurations(list);
    return list[i];
  }
  function findDistrictConfiguration(districtId, type) {
    return getDistrictConfigurations().find(function(c) { 
      return c.districtId === districtId && c.type === type; 
    }) || null;
  }

  /**
   * 小区管理员权限数据模型
   */
  function getDistrictPermissions() {
    var list = get('district_permissions');
    if (list && Array.isArray(list)) return list;
    return [];
  }
  function setDistrictPermissions(list) {
    set('district_permissions', Array.isArray(list) ? list : []);
  }
  function addDistrictPermission(permission) {
    var list = getDistrictPermissions().slice();
    if (!permission.id) {
      permission.id = 'permission_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }
    permission.createTime = permission.createTime || new Date().toISOString();
    permission.updateTime = permission.createTime;
    permission.status = permission.status || 'active';
    list.unshift(permission);
    setDistrictPermissions(list);
    return permission;
  }
  function updateDistrictPermission(id, patch) {
    var list = getDistrictPermissions().slice();
    var i = list.findIndex(function (p) { return p.id === id; });
    if (i === -1) return null;
    for (var k in patch) if (patch.hasOwnProperty(k)) list[i][k] = patch[k];
    list[i].updateTime = new Date().toISOString();
    setDistrictPermissions(list);
    return list[i];
  }
  function getDistrictPermissionsByUser(userId) {
    return getDistrictPermissions().filter(function(p) { 
      return p.userId === userId && p.status === 'active'; 
    });
  }
  function getDistrictPermissionsByDistrict(districtId) {
    return getDistrictPermissions().filter(function(p) { 
      return p.districtId === districtId && p.status === 'active'; 
    });
  }

  /**
   * 数据隔离机制：为每个小区创建独立的数据空间
   */
  function getDistrictDataStore(districtId, storeType) {
    var storeKey = 'district_data_' + districtId + '_' + storeType;
    var data = get(storeKey);
    if (!data) {
      data = {
        id: storeKey,
        districtId: districtId,
        type: storeType,
        data: {},
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      };
      set(storeKey, data);
    }
    return data;
  }
  function setDistrictDataStore(districtId, storeType, data) {
    var storeKey = 'district_data_' + districtId + '_' + storeType;
    var storeData = {
      id: storeKey,
      districtId: districtId,
      type: storeType,
      data: data,
      createTime: data.createTime || new Date().toISOString(),
      updateTime: new Date().toISOString()
    };
    set(storeKey, storeData);
    return storeData;
  }

  /**
   * 批量初始化测试数据
   */
  function seedDistricts() {
    var now = new Date().toISOString();
    var list = [
      {
        id: 'district_001',
        name: '阳光小区',
        address: '阳光路 88 号',
        description: '高端住宅小区，环境优美，配套设施完善',
        totalHouseholds: 520,
        builtYear: 2015,
        area: 85000,
        buildingCount: 12,
        floorsPerBuilding: 18,
        unitsPerFloor: 2,
        propertyType: 'residential',
        facilities: ['游泳池', '健身房', '儿童游乐场', '老年活动中心'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      },
      {
        id: 'district_002',
        name: '翠湖小区',
        address: '翠湖大道 12 号',
        description: '湖景住宅小区，环境优美，交通便利',
        totalHouseholds: 380,
        builtYear: 2018,
        area: 65000,
        buildingCount: 8,
        floorsPerBuilding: 22,
        unitsPerFloor: 3,
        propertyType: 'residential',
        facilities: ['湖景公园', '篮球场', '羽毛球馆'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      },
      {
        id: 'district_003',
        name: '锦绣小区',
        address: '锦绣街 36 号',
        description: '新建豪华住宅小区，智能化程度高',
        totalHouseholds: 750,
        builtYear: 2022,
        area: 120000,
        buildingCount: 15,
        floorsPerBuilding: 30,
        unitsPerFloor: 4,
        propertyType: 'luxury',
        facilities: ['智能门禁', '地下停车场', '商业中心', '幼儿园'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      },
      {
        id: 'district_004',
        name: '锦绣花园',
        address: '锦绣路 128 号',
        description: '中型花园小区，绿化覆盖率高',
        totalHouseholds: 450,
        builtYear: 2016,
        area: 68000,
        buildingCount: 10,
        floorsPerBuilding: 20,
        unitsPerFloor: 2,
        propertyType: 'garden',
        facilities: ['花园广场', '棋牌室', '健身步道', '儿童乐园'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      },
      {
        id: 'district_005',
        name: '紫金苑',
        address: '紫金路 56 号',
        description: '高端别墅区，私密性强',
        totalHouseholds: 180,
        builtYear: 2019,
        area: 95000,
        buildingCount: 20,
        floorsPerBuilding: 3,
        unitsPerFloor: 1,
        propertyType: 'villa',
        facilities: ['私家花园', '地下车库', '会所', '游泳池'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      },
      {
        id: 'district_006',
        name: '幸福家园',
        address: '幸福街 78 号',
        description: '经济适用房小区，适合工薪家庭',
        totalHouseholds: 890,
        builtYear: 2012,
        area: 55000,
        buildingCount: 18,
        floorsPerBuilding: 6,
        unitsPerFloor: 4,
        propertyType: 'economy',
        facilities: ['社区中心', '菜市场', '幼儿园', '小广场'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      },
      {
        id: 'district_007',
        name: '天湖明珠',
        address: '天湖路 200 号',
        description: '湖景高层住宅，视野开阔',
        totalHouseholds: 620,
        builtYear: 2020,
        area: 78000,
        buildingCount: 6,
        floorsPerBuilding: 35,
        unitsPerFloor: 6,
        propertyType: 'highrise',
        facilities: ['空中花园', '观景台', '健身房', '儿童乐园'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      },
      {
        id: 'district_008',
        name: '东方明珠',
        address: '东方路 168 号',
        description: '高端商业综合体住宅',
        totalHouseholds: 480,
        builtYear: 2021,
        area: 92000,
        buildingCount: 4,
        floorsPerBuilding: 40,
        unitsPerFloor: 3,
        propertyType: 'commercial',
        facilities: ['购物中心', '美食街', '电影院', '儿童乐园'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      },
      {
        id: 'district_009',
        name: '绿色家园',
        address: '绿色大道 88 号',
        description: '环保型住宅小区，绿色建筑认证',
        totalHouseholds: 360,
        builtYear: 2019,
        area: 58000,
        buildingCount: 12,
        floorsPerBuilding: 12,
        unitsPerFloor: 2,
        propertyType: 'eco',
        facilities: ['太阳能板', '雨水回收系统', '有机菜园', '垃圾分类站'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      },
      {
        id: 'district_010',
        name: '智慧社区',
        address: '智慧路 66 号',
        description: '全智能住宅小区，5G全覆盖',
        totalHouseholds: 720,
        builtYear: 2023,
        area: 105000,
        buildingCount: 8,
        floorsPerBuilding: 32,
        unitsPerFloor: 3,
        propertyType: 'smart',
        facilities: ['AI管家', '无人配送', '智能停车', '远程控制'],
        status: 'active',
        createTime: now,
        updateTime: now,
        version: 1
      }
    ];
    setDistricts(list);
  }

  function seedPropertyManagement() {
    var now = new Date().toISOString();
    var list = [
      {
        id: 'property_001',
        districtId: 'district_001',
        propertyName: '阳光物业服务有限公司',
        propertyManager: '张经理',
        managerPhone: '13800138001',
        managerEmail: 'zhang@example.com',
        servicePhone: '4001234567',
        emergencyPhone: '13900139001',
        workingHours: '08:00-18:00',
        contractStart: '2023-01-01',
        contractEnd: '2026-12-31',
        monthlyFee: 2.5,
        annualRevenue: 1560000,
        staffCount: 35,
        rating: 4.2,
        complaintRate: '8.5%',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'property_002',
        districtId: 'district_002',
        propertyName: '翠湖物业管理公司',
        propertyManager: '李经理',
        managerPhone: '13800138002',
        managerEmail: 'li@example.com',
        servicePhone: '4001234568',
        emergencyPhone: '13900139002',
        workingHours: '08:00-18:00',
        contractStart: '2023-06-01',
        contractEnd: '2027-05-31',
        monthlyFee: 2.8,
        annualRevenue: 1276800,
        staffCount: 28,
        rating: 4.5,
        complaintRate: '6.2%',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'property_003',
        districtId: 'district_003',
        propertyName: '锦绣高端物业管理有限公司',
        propertyManager: '王经理',
        managerPhone: '13800138003',
        managerEmail: 'wang@example.com',
        servicePhone: '4001234569',
        emergencyPhone: '13900139003',
        workingHours: '07:00-19:00',
        contractStart: '2022-01-01',
        contractEnd: '2027-12-31',
        monthlyFee: 3.5,
        annualRevenue: 3150000,
        staffCount: 52,
        rating: 4.8,
        complaintRate: '3.1%',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'property_004',
        districtId: 'district_004',
        propertyName: '锦绣花园物业管理处',
        propertyManager: '赵经理',
        managerPhone: '13800138004',
        managerEmail: 'zhao@example.com',
        servicePhone: '4001234570',
        emergencyPhone: '13900139004',
        workingHours: '08:00-17:00',
        contractStart: '2022-01-01',
        contractEnd: '2025-12-31',
        monthlyFee: 2.2,
        annualRevenue: 1188000,
        staffCount: 25,
        rating: 4.0,
        complaintRate: '10.2%',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'property_005',
        districtId: 'district_005',
        propertyName: '紫金苑别墅物业服务中心',
        propertyManager: '孙经理',
        managerPhone: '13800138005',
        managerEmail: 'sun@example.com',
        servicePhone: '4001234571',
        emergencyPhone: '13900139005',
        workingHours: '24小时',
        contractStart: '2021-01-01',
        contractEnd: '2028-12-31',
        monthlyFee: 5.0,
        annualRevenue: 1080000,
        staffCount: 15,
        rating: 4.9,
        complaintRate: '2.1%',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'property_006',
        districtId: 'district_006',
        propertyName: '幸福家园物业服务中心',
        propertyManager: '周经理',
        managerPhone: '13800138006',
        managerEmail: 'zhou@example.com',
        servicePhone: '4001234572',
        emergencyPhone: '13900139006',
        workingHours: '08:00-17:00',
        contractStart: '2020-01-01',
        contractEnd: '2024-12-31',
        monthlyFee: 1.8,
        annualRevenue: 1922400,
        staffCount: 40,
        rating: 3.8,
        complaintRate: '15.3%',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'property_007',
        districtId: 'district_007',
        propertyName: '天湖明珠物业管理有限公司',
        propertyManager: '吴经理',
        managerPhone: '13800138007',
        managerEmail: 'wu@example.com',
        servicePhone: '4001234573',
        emergencyPhone: '13900139007',
        workingHours: '06:00-22:00',
        contractStart: '2021-01-01',
        contractEnd: '2026-12-31',
        monthlyFee: 3.2,
        annualRevenue: 2380800,
        staffCount: 45,
        rating: 4.6,
        complaintRate: '5.8%',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'property_008',
        districtId: 'district_008',
        propertyName: '东方商业综合体物业服务有限公司',
        propertyManager: '郑经理',
        managerPhone: '13800138008',
        managerEmail: 'zheng@example.com',
        servicePhone: '4001234574',
        emergencyPhone: '13900139008',
        workingHours: '07:00-23:00',
        contractStart: '2020-01-01',
        contractEnd: '2025-12-31',
        monthlyFee: 4.0,
        annualRevenue: 2304000,
        staffCount: 60,
        rating: 4.4,
        complaintRate: '7.2%',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'property_009',
        districtId: 'district_009',
        propertyName: '绿色家园环保物业服务中心',
        propertyManager: '钱经理',
        managerPhone: '13800138009',
        managerEmail: 'qian@example.com',
        servicePhone: '4001234575',
        emergencyPhone: '13900139009',
        workingHours: '08:00-18:00',
        contractStart: '2021-01-01',
        contractEnd: '2026-12-31',
        monthlyFee: 2.6,
        annualRevenue: 1123200,
        staffCount: 20,
        rating: 4.3,
        complaintRate: '8.9%',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'property_010',
        districtId: 'district_010',
        propertyName: '智慧社区科技物业服务有限公司',
        propertyManager: '冯经理',
        managerPhone: '13800138010',
        managerEmail: 'feng@example.com',
        servicePhone: '4001234576',
        emergencyPhone: '13900139010',
        workingHours: '24小时',
        contractStart: '2023-01-01',
        contractEnd: '2028-12-31',
        monthlyFee: 4.2,
        annualRevenue: 3628800,
        staffCount: 35,
        rating: 4.7,
        complaintRate: '3.5%',
        status: 'active',
        createTime: now,
        updateTime: now
      }
    ];
    setPropertyManagement(list);
  }

  function seedDistrictConfigurations() {
    var now = new Date().toISOString();
    var configurations = [
      // 门禁系统配置
      {
        id: 'config_001',
        districtId: 'district_001',
        type: 'access_control',
        name: '门禁系统配置',
        config: {
          systemType: '人脸识别+刷卡',
          accessPoints: ['主入口', '地下车库入口', '单元门'],
          workingHours: '06:00-22:00',
          visitorManagement: '预约制',
          emergencyAccess: true,
          biometricEnabled: true,
          cardEnabled: true
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_002',
        districtId: 'district_002',
        type: 'access_control',
        name: '门禁系统配置',
        config: {
          systemType: '刷卡+密码',
          accessPoints: ['主入口', '地下车库入口'],
          workingHours: '06:00-22:00',
          visitorManagement: '登记制',
          emergencyAccess: true,
          biometricEnabled: false,
          cardEnabled: true
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_003',
        districtId: 'district_003',
        type: 'access_control',
        name: '门禁系统配置',
        config: {
          systemType: '智能人脸识别',
          accessPoints: ['主入口', '地下车库入口', '单元门', '商业入口'],
          workingHours: '24小时',
          visitorManagement: '智能预约',
          emergencyAccess: true,
          biometricEnabled: true,
          cardEnabled: true,
          voiceEnabled: true
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      // 停车管理配置
      {
        id: 'config_004',
        districtId: 'district_001',
        type: 'parking_management',
        name: '停车管理配置',
        config: {
          totalSpaces: 620,
          residentSpaces: 520,
          visitorSpaces: 100,
          monthlyFee: 300,
          visitorFee: 10,
          maxHours: 24,
          enforcement: '车牌识别',
          electricCharging: 20
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_005',
        districtId: 'district_002',
        type: 'parking_management',
        name: '停车管理配置',
        config: {
          totalSpaces: 450,
          residentSpaces: 380,
          visitorSpaces: 70,
          monthlyFee: 350,
          visitorFee: 15,
          maxHours: 12,
          enforcement: '人工管理',
          electricCharging: 10
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_006',
        districtId: 'district_003',
        type: 'parking_management',
        name: '停车管理配置',
        config: {
          totalSpaces: 950,
          residentSpaces: 750,
          visitorSpaces: 200,
          monthlyFee: 500,
          visitorFee: 20,
          maxHours: 48,
          enforcement: '智能车牌识别',
          electricCharging: 50
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      // 公共设施配置
      {
        id: 'config_007',
        districtId: 'district_001',
        type: 'public_facilities',
        name: '公共设施配置',
        config: {
          facilities: [
            { name: '游泳池', type: 'recreation', capacity: 100, maintenance: '每月' },
            { name: '健身房', type: 'fitness', capacity: 50, maintenance: '每周' },
            { name: '儿童游乐场', type: 'children', capacity: 30, maintenance: '每周' },
            { name: '老年活动中心', type: 'senior', capacity: 40, maintenance: '每周' }
          ],
          bookingSystem: '预约制',
          openingHours: '06:00-22:00',
          safetyFeatures: ['监控摄像头', '紧急呼叫', '安全巡逻']
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_008',
        districtId: 'district_002',
        type: 'public_facilities',
        name: '公共设施配置',
        config: {
          facilities: [
            { name: '湖景公园', type: 'park', capacity: 200, maintenance: '每周' },
            { name: '篮球场', type: 'sports', capacity: 20, maintenance: '每月' },
            { name: '羽毛球馆', type: 'sports', capacity: 16, maintenance: '每月' }
          ],
          bookingSystem: '现场登记',
          openingHours: '06:00-21:00',
          safetyFeatures: ['监控摄像头', '照明设备']
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_009',
        districtId: 'district_003',
        type: 'public_facilities',
        name: '公共设施配置',
        config: {
          facilities: [
            { name: '智能门禁', type: 'security', capacity: null, maintenance: '实时' },
            { name: '地下停车场', type: 'parking', capacity: 950, maintenance: '每日' },
            { name: '商业中心', type: 'commercial', capacity: 500, maintenance: '每周' },
            { name: '幼儿园', type: 'education', capacity: 120, maintenance: '每日' }
          ],
          bookingSystem: '智能预约',
          openingHours: '24小时',
          safetyFeatures: ['全方位监控', '智能安防', '紧急响应系统']
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      // 锦绣花园配置
      {
        id: 'config_010',
        districtId: 'district_004',
        type: 'access_control',
        name: '门禁系统配置',
        config: {
          systemType: '刷卡+密码',
          accessPoints: ['主入口', '花园入口'],
          workingHours: '06:00-22:00',
          visitorManagement: '登记制',
          emergencyAccess: true,
          biometricEnabled: false,
          cardEnabled: true
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_011',
        districtId: 'district_004',
        type: 'parking_management',
        name: '停车管理配置',
        config: {
          totalSpaces: 540,
          residentSpaces: 450,
          visitorSpaces: 90,
          monthlyFee: 200,
          visitorFee: 8,
          maxHours: 12,
          enforcement: '人工管理',
          electricCharging: 15
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_012',
        districtId: 'district_004',
        type: 'public_facilities',
        name: '公共设施配置',
        config: {
          facilities: [
            { name: '花园广场', type: 'recreation', capacity: 150, maintenance: '每周' },
            { name: '棋牌室', type: 'entertainment', capacity: 30, maintenance: '每周' },
            { name: '健身步道', type: 'fitness', capacity: null, maintenance: '每日' },
            { name: '儿童乐园', type: 'children', capacity: 25, maintenance: '每周' }
          ],
          bookingSystem: '现场登记',
          openingHours: '06:00-21:00',
          safetyFeatures: ['监控摄像头', '照明设备', '安全巡逻']
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      // 紫金苑配置
      {
        id: 'config_013',
        districtId: 'district_005',
        type: 'access_control',
        name: '门禁系统配置',
        config: {
          systemType: '私家门禁+小区门禁',
          accessPoints: ['别墅入口', '会所入口', '大门入口'],
          workingHours: '24小时',
          visitorManagement: '预约制',
          emergencyAccess: true,
          biometricEnabled: true,
          cardEnabled: true
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_014',
        districtId: 'district_005',
        type: 'parking_management',
        name: '停车管理配置',
        config: {
          totalSpaces: 220,
          residentSpaces: 180,
          visitorSpaces: 40,
          monthlyFee: 800,
          visitorFee: 50,
          maxHours: 48,
          enforcement: '人工管理',
          electricCharging: 5
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_015',
        districtId: 'district_005',
        type: 'public_facilities',
        name: '公共设施配置',
        config: {
          facilities: [
            { name: '私家花园', type: 'garden', capacity: null, maintenance: '每日' },
            { name: '地下车库', type: 'parking', capacity: 220, maintenance: '每日' },
            { name: '会所', type: 'club', capacity: 100, maintenance: '每周' },
            { name: '游泳池', type: 'recreation', capacity: 50, maintenance: '每周' }
          ],
          bookingSystem: '预约制',
          openingHours: '24小时',
          safetyFeatures: ['24小时监控', '私人保安', '紧急呼叫系统']
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      // 幸福家园配置
      {
        id: 'config_016',
        districtId: 'district_006',
        type: 'access_control',
        name: '门禁系统配置',
        config: {
          systemType: '刷卡门禁',
          accessPoints: ['主入口', '侧门'],
          workingHours: '06:00-22:00',
          visitorManagement: '登记制',
          emergencyAccess: true,
          biometricEnabled: false,
          cardEnabled: true
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_017',
        districtId: 'district_006',
        type: 'parking_management',
        name: '停车管理配置',
        config: {
          totalSpaces: 220,
          residentSpaces: 180,
          visitorSpaces: 40,
          monthlyFee: 100,
          visitorFee: 5,
          maxHours: 8,
          enforcement: '车牌识别',
          electricCharging: 5
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      },
      {
        id: 'config_018',
        districtId: 'district_006',
        type: 'public_facilities',
        name: '公共设施配置',
        config: {
          facilities: [
            { name: '社区中心', type: 'community', capacity: 200, maintenance: '每日' },
            { name: '菜市场', type: 'commercial', capacity: 100, maintenance: '每日' },
            { name: '幼儿园', type: 'education', capacity: 120, maintenance: '每日' },
            { name: '小广场', type: 'recreation', capacity: 80, maintenance: '每周' }
          ],
          bookingSystem: '现场使用',
          openingHours: '06:00-20:00',
          safetyFeatures: ['监控摄像头', '保安巡逻']
        },
        createTime: now,
        updateTime: now,
        status: 'active'
      }
    ];
    setDistrictConfigurations(configurations);
  }

  function seedDistrictPermissions() {
    var now = new Date().toISOString();
    var permissions = [
      // 超级管理员权限
      {
        id: 'perm_001',
        userId: 'admin_001',
        districtId: 'all',
        role: 'super_admin',
        permissions: [
          'district_read',
          'district_write',
          'district_delete',
          'property_read',
          'property_write',
          'property_delete',
          'config_read',
          'config_write',
          'config_delete',
          'user_read',
          'user_write',
          'user_delete',
          'data_export',
          'data_import',
          'system_settings'
        ],
        scope: 'all',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      // 社区管理员权限
      {
        id: 'perm_002',
        userId: 'community_001',
        districtId: 'all',
        role: 'community_admin',
        permissions: [
          'district_read',
          'district_write',
          'property_read',
          'property_write',
          'config_read',
          'config_write',
          'user_read',
          'data_export'
        ],
        scope: 'all',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      // 单个小区管理员权限
      {
        id: 'perm_003',
        userId: 'manager_001',
        districtId: 'district_001',
        role: 'district_manager',
        permissions: [
          'district_read',
          'district_write',
          'property_read',
          'property_write',
          'config_read',
          'config_write',
          'user_read'
        ],
        scope: 'single',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'perm_004',
        userId: 'manager_002',
        districtId: 'district_002',
        role: 'district_manager',
        permissions: [
          'district_read',
          'district_write',
          'property_read',
          'property_write',
          'config_read',
          'config_write',
          'user_read'
        ],
        scope: 'single',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      {
        id: 'perm_005',
        userId: 'manager_003',
        districtId: 'district_003',
        role: 'district_manager',
        permissions: [
          'district_read',
          'district_write',
          'property_read',
          'property_write',
          'config_read',
          'config_write',
          'user_read'
        ],
        scope: 'single',
        status: 'active',
        createTime: now,
        updateTime: now
      },
      // 只读权限
      {
        id: 'perm_006',
        userId: 'viewer_001',
        districtId: 'all',
        role: 'viewer',
        permissions: ['district_read', 'property_read', 'config_read'],
        scope: 'all',
        status: 'active',
        createTime: now,
        updateTime: now
      }
    ];
    setDistrictPermissions(permissions);
  }

  /**
   * 权限检查函数
   */
  function checkPermission(userId, districtId, requiredPermission) {
    var userPermissions = getDistrictPermissionsByUser(userId);
    
    // 检查超级管理员
    var superAdmin = userPermissions.find(function(p) {
      return p.role === 'super_admin' && p.scope === 'all';
    });
    if (superAdmin) return true;
    
    // 检查社区管理员（如果districtId为'all'或匹配）
    var communityAdmin = userPermissions.find(function(p) {
      return p.role === 'community_admin' && 
             (p.scope === 'all' || p.districtId === districtId);
    });
    if (communityAdmin) {
      return communityAdmin.permissions.includes(requiredPermission);
    }
    
    // 检查单个小区管理员
    var districtManager = userPermissions.find(function(p) {
      return p.role === 'district_manager' && 
             p.districtId === districtId;
    });
    if (districtManager) {
      return districtManager.permissions.includes(requiredPermission);
    }
    
    // 检查只读权限
    var viewer = userPermissions.find(function(p) {
      return p.role === 'viewer' && 
             (p.scope === 'all' || p.districtId === districtId);
    });
    if (viewer) {
      return viewer.permissions.includes(requiredPermission);
    }
    
    return false;
  }

  /**
   * 数据隔离查询：按小区ID过滤数据
   */
  function getIsolatedTickets(districtId) {
    var allTickets = window.EcosystemBridge.getTickets();
    return allTickets.filter(function(ticket) {
      return ticket.districtId === districtId || ticket.community === getDistrictName(districtId);
    });
  }

  function getIsolatedBulletins(districtId) {
    var allBulletins = window.EcosystemBridge.getBulletins();
    return allBulletins.filter(function(bulletin) {
      return bulletin.districtId === districtId || bulletin.community === getDistrictName(districtId);
    });
  }

  function getIsolatedConsults(districtId) {
    var allConsults = window.EcosystemBridge.getConsult();
    return allConsults.filter(function(consult) {
      return consult.districtId === districtId || consult.community === getDistrictName(districtId);
    });
  }

  /**
   * 辅助函数：获取小区名称
   */
  function getDistrictName(districtId) {
    var district = findDistrict(districtId);
    return district ? district.name : null;
  }

  /**
   * 数据统计和报告功能
   */
  function getDistrictStatistics(districtId) {
    var district = findDistrict(districtId);
    if (!district) return null;
    
    var tickets = getIsolatedTickets(districtId);
    var bulletins = getIsolatedBulletins(districtId);
    var consults = getIsolatedConsults(districtId);
    
    var now = new Date();
    var monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    var recentTickets = tickets.filter(function(t) {
      return new Date(t.createTime) >= monthAgo;
    });
    
    var recentBulletins = bulletins.filter(function(b) {
      return new Date(b.createTime) >= monthAgo;
    });
    
    var recentConsults = consults.filter(function(c) {
      return new Date(c.createTime) >= monthAgo;
    });
    
    var completedTickets = recentTickets.filter(function(t) {
      return t.status === 'completed';
    });
    
    var satisfactionRate = recentTickets.length > 0 ? 
      (completedTickets.length / recentTickets.length * 100).toFixed(1) : 0;
    
    return {
      districtId: districtId,
      districtName: district.name,
      totalHouseholds: district.totalHouseholds,
      ticketStats: {
        total: recentTickets.length,
        completed: completedTickets.length,
        inProgress: recentTickets.filter(function(t) {
          return t.status === 'in_progress';
        }).length,
        pending: recentTickets.filter(function(t) {
          return t.status === 'pending';
        }).length,
        satisfactionRate: satisfactionRate + '%'
      },
      bulletinStats: {
        total: recentBulletins.length,
        important: recentBulletins.filter(function(b) {
          return b.type === 'important';
        }).length
      },
      consultStats: {
        total: recentConsults.length,
        resolved: recentConsults.filter(function(c) {
          return c.status === 'resolved';
        }).length,
        pending: recentConsults.filter(function(c) {
          return c.status === 'pending';
        }).length
      },
      propertyRating: findPropertyManagement(districtId).rating || 0,
      complianceScore: district.complianceScore || 0
    };
  }

  /**
   * 导出数据功能
   */
  function exportDistrictData(districtId, format) {
    var district = findDistrict(districtId);
    if (!district) return null;
    
    var data = {
      district: district,
      property: findPropertyManagement(districtId),
      configurations: getDistrictConfigurations().filter(function(c) {
        return c.districtId === districtId;
      }),
      statistics: getDistrictStatistics(districtId),
      exportTime: new Date().toISOString(),
      format: format || 'json'
    };
    
    if (format === 'csv') {
      return convertToCSV(data);
    } else {
      return JSON.stringify(data, null, 2);
    }
  }

  function convertToCSV(data) {
    // 简化的CSV转换逻辑
    var csv = [
      ['District Name', 'Address', 'Total Households', 'Built Year'],
      [data.district.name, data.district.address, data.district.totalHouseholds, data.district.builtYear]
    ];
    
    return csv.map(function(row) {
      return row.join(',');
    }).join('\n');
  }

  /**
   * 批量操作功能
   */
  function batchUpdateDistricts(districtIds, updates) {
    var results = [];
    districtIds.forEach(function(id) {
      var updated = updateDistrict(id, updates);
      if (updated) {
        results.push({ id: id, success: true, data: updated });
      } else {
        results.push({ id: id, success: false, error: 'District not found' });
      }
    });
    return results;
  }

  function batchDeleteDistricts(districtIds) {
    var results = [];
    districtIds.forEach(function(id) {
      var success = deleteDistrict(id);
      if (success) {
        results.push({ id: id, success: true });
      } else {
        results.push({ id: id, success: false, error: 'District not found' });
      }
    });
    return results;
  }

  /**
   * 数据验证功能
   */
  function validateDistrictData(district) {
    var errors = [];
    
    if (!district.name || district.name.trim() === '') {
      errors.push('小区名称不能为空');
    }
    
    if (!district.address || district.address.trim() === '') {
      errors.push('小区地址不能为空');
    }
    
    if (!district.totalHouseholds || district.totalHouseholds <= 0) {
      errors.push('总户数必须大于0');
    }
    
    if (!district.builtYear || district.builtYear < 1900 || district.builtYear > new Date().getFullYear()) {
      errors.push('建成年份不合法');
    }
    
    if (!district.area || district.area <= 0) {
      errors.push('小区面积必须大于0');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 初始化所有数据
   */
  function initializeAllData() {
    seedDistricts();
    seedPropertyManagement();
    seedDistrictConfigurations();
    seedDistrictPermissions();
  }

  // 公开API
  var districtManagement = {
    // 小区基本信息管理
    getDistricts: getDistricts,
    setDistricts: setDistricts,
    addDistrict: addDistrict,
    updateDistrict: updateDistrict,
    deleteDistrict: deleteDistrict,
    findDistrict: findDistrict,
    
    // 物业管理信息管理
    getPropertyManagement: getPropertyManagement,
    setPropertyManagement: setPropertyManagement,
    addPropertyManagement: addPropertyManagement,
    updatePropertyManagement: updatePropertyManagement,
    findPropertyManagement: findPropertyManagement,
    
    // 配置信息管理
    getDistrictConfigurations: getDistrictConfigurations,
    setDistrictConfigurations: setDistrictConfigurations,
    addDistrictConfiguration: addDistrictConfiguration,
    updateDistrictConfiguration: updateDistrictConfiguration,
    findDistrictConfiguration: findDistrictConfiguration,
    
    // 权限管理
    getDistrictPermissions: getDistrictPermissions,
    setDistrictPermissions: setDistrictPermissions,
    addDistrictPermission: addDistrictPermission,
    updateDistrictPermission: updateDistrictPermission,
    getDistrictPermissionsByUser: getDistrictPermissionsByUser,
    getDistrictPermissionsByDistrict: getDistrictPermissionsByDistrict,
    checkPermission: checkPermission,
    
    // 数据隔离
    getIsolatedTickets: getIsolatedTickets,
    getIsolatedBulletins: getIsolatedBulletins,
    getIsolatedConsults: getIsolatedConsults,
    
    // 统计报告
    getDistrictStatistics: getDistrictStatistics,
    getDistrictName: getDistrictName,
    
    // 数据导出
    exportDistrictData: exportDistrictData,
    
    // 批量操作
    batchUpdateDistricts: batchUpdateDistricts,
    batchDeleteDistricts: batchDeleteDistricts,
    
    // 数据验证
    validateDistrictData: validateDistrictData,
    
    // 初始化
    initializeAllData: initializeAllData,
    seedDistricts: seedDistricts,
    seedPropertyManagement: seedPropertyManagement,
    seedDistrictConfigurations: seedDistrictConfigurations,
    seedDistrictPermissions: seedDistrictPermissions
  };

  // 如果EcosystemBridge已存在，扩展它
  if (typeof window !== 'undefined' && window.EcosystemBridge) {
    Object.assign(window.EcosystemBridge, districtManagement);
  } else {
    window.EcosystemBridge = window.EcosystemBridge || {};
    Object.assign(window.EcosystemBridge, districtManagement);
  }

  // 在首次加载时初始化数据
  if (storage && !storage.getItem(key('district_management_initialized'))) {
    initializeAllData();
    storage.setItem(key('district_management_initialized'), '1');
  }

})(typeof window !== 'undefined' ? window : this);