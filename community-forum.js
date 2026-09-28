(function(window) {
    'use strict';

    var STORAGE_KEY = 'sgzf_community_forum';
    var PREFIX = 'sgzf_';

    function getStorage() {
        try {
            var data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    function setStorage(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            if (typeof BroadcastChannel !== 'undefined') {
                var bc = new BroadcastChannel('sgzf_ecosystem');
                bc.postMessage({ type: 'update', store: 'community_forum' });
            }
        } catch (e) {}
    }

    function generateId() {
        return 'forum_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    function getDefaultCategories() {
        return [
            { id: 'cat_policy', name: '政策解读', icon: 'fa-landmark', color: '#3b82f6', description: '社区政策法规解读与宣传', sortOrder: 1 },
            { id: 'cat_governance', name: '治理动态', icon: 'fa-chart-line', color: '#10b981', description: '社区治理工作动态与进展', sortOrder: 2 },
            { id: 'cat_notice', name: '通知公告', icon: 'fa-bullhorn', color: '#f59e0b', description: '重要通知与公告发布', sortOrder: 3 },
            { id: 'cat_service', name: '便民服务', icon: 'fa-hands-helping', color: '#8b5cf6', description: '便民服务信息与指南', sortOrder: 4 },
            { id: 'cat_discussion', name: '议事讨论', icon: 'fa-comments', color: '#ec4899', description: '社区事务讨论与建议', sortOrder: 5 },
            { id: 'cat_activity', name: '社区活动', icon: 'fa-calendar-alt', color: '#06b6d4', description: '社区活动组织与分享', sortOrder: 6 }
        ];
    }

    function getDefaultTopics() {
        return [
            { id: 'topic_1', name: '物业选聘', categoryId: 'cat_discussion', postCount: 0, followCount: 0, isHot: true },
            { id: 'topic_2', name: '维修资金', categoryId: 'cat_discussion', postCount: 0, followCount: 0, isHot: true },
            { id: 'topic_3', name: '停车管理', categoryId: 'cat_discussion', postCount: 0, followCount: 0, isHot: true },
            { id: 'topic_4', name: '绿化改造', categoryId: 'cat_discussion', postCount: 0, followCount: 0, isHot: false },
            { id: 'topic_5', name: '民法典解读', categoryId: 'cat_policy', postCount: 0, followCount: 0, isHot: true },
            { id: 'topic_6', name: '业主大会', categoryId: 'cat_policy', postCount: 0, followCount: 0, isHot: true }
        ];
    }

    function getDefaultPosts() {
        var now = Date.now();
        var day = 86400000;
        return [
            {
                id: 'post_demo_1',
                title: '关于《民法典》业主共同决定事项的解读',
                content: '<p>根据《民法典》第二百七十八条规定，下列事项由业主共同决定：</p><ol><li>制定和修改业主大会议事规则；</li><li>制定和修改管理规约；</li><li>选举业主委员会或者更换业主委员会成员；</li><li>选聘和解聘物业服务企业或者其他管理人；</li><li>使用建筑物及其附属设施的维修资金；</li><li>筹集建筑物及其附属设施的维修资金；</li><li>改建、重建建筑物及其附属设施；</li><li>改变共有部分的用途或者利用共有部分从事经营活动；</li><li>有关共有和共同管理权利的其他重大事项。</li></ol><p>业主共同决定事项，应当由专有部分面积占比三分之二以上的业主且人数占比三分之二以上的业主参与表决。</p>',
                summary: '解读《民法典》中关于业主共同决定事项的规定，帮助业主了解自己的权利与义务。',
                categoryId: 'cat_policy',
                topicIds: ['topic_5', 'topic_6'],
                author: {
                    id: 'community_officer',
                    name: '张专员',
                    role: 'community_officer',
                    department: '和平社区居委会',
                    avatar: null
                },
                status: 'published',
                isTop: true,
                isEssence: true,
                viewCount: 1256,
                likeCount: 89,
                commentCount: 23,
                shareCount: 45,
                collectCount: 67,
                tags: ['民法典', '业主权利', '业主大会'],
                createTime: now - 5 * day,
                updateTime: now - 5 * day,
                publishTime: now - 5 * day,
                lastCommentTime: now - 1 * day,
                district: 'all'
            },
            {
                id: 'post_demo_2',
                title: '本周社区治理工作动态（3月第三周）',
                content: '<p>本周社区治理工作要点：</p><h4>一、物业履约监督</h4><p>完成对江上花园、阳光小区物业履约情况检查，整体履约率达92%。</p><h4>二、合规审计</h4><p>完成业委会履职合规评估报告审核3份，发现问题2项，已督促整改。</p><h4>三、临时业主大会建议</h4><p>收到议事厅触发的临时业主大会建议1件，正在研判中。</p><h4>四、下周工作计划</h4><p>1. 开展物业服务质量专项检查<br>2. 组织业委会培训会议<br>3. 推进小区公共收益公示工作</p>',
                summary: '本周社区治理工作要点汇总，包括物业履约监督、合规审计、临时业主大会建议处理等。',
                categoryId: 'cat_governance',
                topicIds: [],
                author: {
                    id: 'community_officer',
                    name: '张专员',
                    role: 'community_officer',
                    department: '和平社区居委会',
                    avatar: null
                },
                status: 'published',
                isTop: false,
                isEssence: false,
                viewCount: 432,
                likeCount: 34,
                commentCount: 8,
                shareCount: 12,
                collectCount: 15,
                tags: ['工作动态', '周报'],
                createTime: now - 1 * day,
                updateTime: now - 1 * day,
                publishTime: now - 1 * day,
                lastCommentTime: now - 12 * 3600000,
                district: 'all'
            },
            {
                id: 'post_demo_3',
                title: '关于开展小区消防安全检查的通知',
                content: '<p>各小区业委会、物业服务企业：</p><p>为切实保障小区消防安全，根据上级部门要求，现决定在辖区范围内开展消防安全专项检查工作。</p><h4>检查时间</h4><p>2026年3月20日至3月31日</p><h4>检查内容</h4><ol><li>消防通道是否畅通</li><li>消防设施设备是否完好</li><li>消防控制室值班情况</li><li>电动自行车充电管理</li><li>消防演练开展情况</li></ol><h4>工作要求</h4><p>请各小区高度重视，积极配合检查工作，发现问题及时整改。</p><p>和平社区居委会<br>2026年3月18日</p>',
                summary: '关于在辖区范围内开展消防安全专项检查工作的通知，请各小区积极配合。',
                categoryId: 'cat_notice',
                topicIds: [],
                author: {
                    id: 'community_officer',
                    name: '张专员',
                    role: 'community_officer',
                    department: '和平社区居委会',
                    avatar: null
                },
                status: 'published',
                isTop: true,
                isEssence: false,
                viewCount: 678,
                likeCount: 45,
                commentCount: 12,
                shareCount: 89,
                collectCount: 23,
                tags: ['通知', '消防安全'],
                createTime: now - 2 * 3600000,
                updateTime: now - 2 * 3600000,
                publishTime: now - 2 * 3600000,
                lastCommentTime: now - 1 * 3600000,
                district: 'all'
            }
        ];
    }

    function getDefaultComments() {
        var now = Date.now();
        return [
            {
                id: 'comment_demo_1',
                postId: 'post_demo_1',
                parentId: null,
                content: '这个解读很详细，对我们业主了解自己的权利很有帮助！',
                author: {
                    id: 'owner_1',
                    name: '王先生',
                    room: '1-101',
                    role: 'owner',
                    avatar: null
                },
                status: 'normal',
                likeCount: 12,
                replyCount: 2,
                createTime: now - 2 * 86400000,
                isAuthorReply: false
            },
            {
                id: 'comment_demo_2',
                postId: 'post_demo_1',
                parentId: 'comment_demo_1',
                content: '感谢支持！如有疑问可以继续留言讨论。',
                author: {
                    id: 'community_officer',
                    name: '张专员',
                    role: 'community_officer',
                    department: '和平社区居委会',
                    avatar: null
                },
                status: 'normal',
                likeCount: 5,
                replyCount: 0,
                createTime: now - 1 * 86400000,
                isAuthorReply: true
            },
            {
                id: 'comment_demo_3',
                postId: 'post_demo_3',
                parentId: null,
                content: '收到，我们会积极配合检查工作。',
                author: {
                    id: 'property_manager',
                    name: '李经理',
                    role: 'property_manager',
                    department: '江上花园物业服务中心',
                    avatar: null
                },
                status: 'normal',
                likeCount: 8,
                replyCount: 0,
                createTime: now - 1 * 3600000,
                isAuthorReply: false
            }
        ];
    }

    function seedDefaultData() {
        var data = {
            categories: getDefaultCategories(),
            topics: getDefaultTopics(),
            posts: getDefaultPosts(),
            comments: getDefaultComments(),
            userInteractions: {},
            reportRecords: [],
            auditLogs: []
        };
        setStorage(data);
        return data;
    }

    function getData() {
        var data = getStorage();
        if (!data) {
            data = seedDefaultData();
        }
        return data;
    }

    function sanitizeContent(content) {
        if (!content) return '';
        var div = document.createElement('div');
        div.textContent = content;
        return div.innerHTML;
    }

    function validatePost(post) {
        var errors = [];
        if (!post.title || post.title.trim().length < 5) {
            errors.push('标题至少需要5个字符');
        }
        if (!post.content || post.content.trim().length < 20) {
            errors.push('内容至少需要20个字符');
        }
        if (!post.categoryId) {
            errors.push('请选择帖子分类');
        }
        return errors;
    }

    function containsSensitiveWords(content) {
        var sensitiveWords = ['广告', '代开发票', '刷单', '贷款', '信用卡套现'];
        var found = [];
        sensitiveWords.forEach(function(word) {
            if (content.indexOf(word) !== -1) {
                found.push(word);
            }
        });
        return found;
    }

    var Database = {
        getCategories: function() {
            var data = getData();
            return data.categories || [];
        },

        getCategoryById: function(id) {
            var categories = this.getCategories();
            return categories.find(function(c) { return c.id === id; });
        },

        getTopics: function() {
            var data = getData();
            return data.topics || [];
        },

        getHotTopics: function(limit) {
            var topics = this.getTopics();
            return topics.filter(function(t) { return t.isHot; }).slice(0, limit || 10);
        },

        getTopicsByCategory: function(categoryId) {
            var topics = this.getTopics();
            return topics.filter(function(t) { return t.categoryId === categoryId; });
        },

        getPosts: function(filters) {
            var data = getData();
            var posts = data.posts || [];
            
            if (filters) {
                if (filters.categoryId) {
                    posts = posts.filter(function(p) { return p.categoryId === filters.categoryId; });
                }
                if (filters.status) {
                    posts = posts.filter(function(p) { return p.status === filters.status; });
                }
                if (filters.authorId) {
                    posts = posts.filter(function(p) { return p.author.id === filters.authorId; });
                }
                if (filters.district && filters.district !== 'all') {
                    posts = posts.filter(function(p) { return p.district === filters.district || p.district === 'all'; });
                }
                if (filters.isTop !== undefined) {
                    posts = posts.filter(function(p) { return p.isTop === filters.isTop; });
                }
                if (filters.keyword) {
                    var keyword = filters.keyword.toLowerCase();
                    posts = posts.filter(function(p) {
                        return p.title.toLowerCase().indexOf(keyword) !== -1 ||
                               p.summary.toLowerCase().indexOf(keyword) !== -1 ||
                               (p.tags && p.tags.some(function(t) { return t.toLowerCase().indexOf(keyword) !== -1; }));
                    });
                }
            }
            
            return posts;
        },

        getPostById: function(id) {
            var posts = this.getPosts();
            return posts.find(function(p) { return p.id === id; }) || null;
        },

        addPost: function(post) {
            var data = getData();
            if (!data.posts) data.posts = [];
            
            var newPost = {
                id: generateId(),
                title: sanitizeContent(post.title),
                content: post.content,
                summary: sanitizeContent(post.summary) || post.title,
                categoryId: post.categoryId,
                topicIds: post.topicIds || [],
                author: post.author,
                status: 'published',
                isTop: false,
                isEssence: false,
                viewCount: 0,
                likeCount: 0,
                commentCount: 0,
                shareCount: 0,
                collectCount: 0,
                tags: post.tags || [],
                createTime: Date.now(),
                updateTime: Date.now(),
                publishTime: Date.now(),
                lastCommentTime: null,
                district: post.district || 'all'
            };
            
            data.posts.unshift(newPost);
            
            if (!data.auditLogs) data.auditLogs = [];
            data.auditLogs.push({
                action: 'create_post',
                postId: newPost.id,
                operator: post.author,
                time: Date.now()
            });
            
            setStorage(data);
            return newPost;
        },

        updatePost: function(id, updates) {
            var data = getData();
            var index = data.posts.findIndex(function(p) { return p.id === id; });
            if (index === -1) return null;
            
            for (var key in updates) {
                if (updates.hasOwnProperty(key) && key !== 'id' && key !== 'createTime' && key !== 'author') {
                    data.posts[index][key] = updates[key];
                }
            }
            data.posts[index].updateTime = Date.now();
            
            if (!data.auditLogs) data.auditLogs = [];
            data.auditLogs.push({
                action: 'update_post',
                postId: id,
                operator: updates.operator,
                time: Date.now()
            });
            
            setStorage(data);
            return data.posts[index];
        },

        deletePost: function(id, operator) {
            var data = getData();
            var index = data.posts.findIndex(function(p) { return p.id === id; });
            if (index === -1) return false;
            
            data.posts.splice(index, 1);
            
            data.comments = (data.comments || []).filter(function(c) { return c.postId !== id; });
            
            if (!data.auditLogs) data.auditLogs = [];
            data.auditLogs.push({
                action: 'delete_post',
                postId: id,
                operator: operator,
                time: Date.now()
            });
            
            setStorage(data);
            return true;
        },

        getComments: function(postId, filters) {
            var data = getData();
            var comments = data.comments || [];
            
            if (postId) {
                comments = comments.filter(function(c) { return c.postId === postId; });
            }
            
            if (filters) {
                if (filters.status) {
                    comments = comments.filter(function(c) { return c.status === filters.status; });
                }
                if (filters.parentId !== undefined) {
                    comments = comments.filter(function(c) { return c.parentId === filters.parentId; });
                }
            }
            
            return comments.sort(function(a, b) { return b.createTime - a.createTime; });
        },

        getCommentById: function(id) {
            var comments = this.getComments();
            return comments.find(function(c) { return c.id === id; }) || null;
        },

        addComment: function(comment) {
            var data = getData();
            if (!data.comments) data.comments = [];
            
            var newComment = {
                id: generateId(),
                postId: comment.postId,
                parentId: comment.parentId || null,
                content: sanitizeContent(comment.content),
                author: comment.author,
                status: 'normal',
                likeCount: 0,
                replyCount: 0,
                createTime: Date.now(),
                isAuthorReply: comment.isAuthorReply || false
            };
            
            data.comments.unshift(newComment);
            
            var postIndex = data.posts.findIndex(function(p) { return p.id === comment.postId; });
            if (postIndex !== -1) {
                data.posts[postIndex].commentCount = (data.posts[postIndex].commentCount || 0) + 1;
                data.posts[postIndex].lastCommentTime = Date.now();
            }
            
            if (comment.parentId) {
                var parentIndex = data.comments.findIndex(function(c) { return c.id === comment.parentId; });
                if (parentIndex !== -1) {
                    data.comments[parentIndex].replyCount = (data.comments[parentIndex].replyCount || 0) + 1;
                }
            }
            
            setStorage(data);
            return newComment;
        },

        updateComment: function(id, updates) {
            var data = getData();
            var index = data.comments.findIndex(function(c) { return c.id === id; });
            if (index === -1) return null;
            
            for (var key in updates) {
                if (updates.hasOwnProperty(key) && key !== 'id' && key !== 'createTime' && key !== 'author') {
                    data.comments[index][key] = updates[key];
                }
            }
            
            setStorage(data);
            return data.comments[index];
        },

        deleteComment: function(id) {
            var data = getData();
            var comment = data.comments.find(function(c) { return c.id === id; });
            if (!comment) return false;
            
            var replyCount = data.comments.filter(function(c) { return c.parentId === id; }).length;
            
            data.comments = data.comments.filter(function(c) { return c.id !== id && c.parentId !== id; });
            
            var postIndex = data.posts.findIndex(function(p) { return p.id === comment.postId; });
            if (postIndex !== -1) {
                data.posts[postIndex].commentCount = Math.max(0, (data.posts[postIndex].commentCount || 0) - 1 - replyCount);
            }
            
            if (comment.parentId) {
                var parentIndex = data.comments.findIndex(function(c) { return c.id === comment.parentId; });
                if (parentIndex !== -1) {
                    data.comments[parentIndex].replyCount = Math.max(0, (data.comments[parentIndex].replyCount || 0) - 1);
                }
            }
            
            setStorage(data);
            return true;
        },

        getUserInteractions: function(userId) {
            var data = getData();
            if (!data.userInteractions) data.userInteractions = {};
            if (!data.userInteractions[userId]) {
                data.userInteractions[userId] = {
                    likedPosts: [],
                    likedComments: [],
                    collectedPosts: [],
                    followedTopics: [],
                    followedUsers: []
                };
            }
            return data.userInteractions[userId];
        },

        toggleLikePost: function(postId, userId) {
            var data = getData();
            var interactions = this.getUserInteractions(userId);
            var postIndex = data.posts.findIndex(function(p) { return p.id === postId; });
            if (postIndex === -1) return null;
            
            var likedIndex = interactions.likedPosts.indexOf(postId);
            if (likedIndex > -1) {
                interactions.likedPosts.splice(likedIndex, 1);
                data.posts[postIndex].likeCount = Math.max(0, (data.posts[postIndex].likeCount || 0) - 1);
            } else {
                interactions.likedPosts.push(postId);
                data.posts[postIndex].likeCount = (data.posts[postIndex].likeCount || 0) + 1;
            }
            
            data.userInteractions[userId] = interactions;
            setStorage(data);
            return { liked: likedIndex === -1, count: data.posts[postIndex].likeCount };
        },

        toggleLikeComment: function(commentId, userId) {
            var data = getData();
            var interactions = this.getUserInteractions(userId);
            var commentIndex = data.comments.findIndex(function(c) { return c.id === commentId; });
            if (commentIndex === -1) return null;
            
            var likedIndex = interactions.likedComments.indexOf(commentId);
            if (likedIndex > -1) {
                interactions.likedComments.splice(likedIndex, 1);
                data.comments[commentIndex].likeCount = Math.max(0, (data.comments[commentIndex].likeCount || 0) - 1);
            } else {
                interactions.likedComments.push(commentId);
                data.comments[commentIndex].likeCount = (data.comments[commentIndex].likeCount || 0) + 1;
            }
            
            data.userInteractions[userId] = interactions;
            setStorage(data);
            return { liked: likedIndex === -1, count: data.comments[commentIndex].likeCount };
        },

        toggleCollectPost: function(postId, userId) {
            var data = getData();
            var interactions = this.getUserInteractions(userId);
            var postIndex = data.posts.findIndex(function(p) { return p.id === postId; });
            if (postIndex === -1) return null;
            
            var collectedIndex = interactions.collectedPosts.indexOf(postId);
            if (collectedIndex > -1) {
                interactions.collectedPosts.splice(collectedIndex, 1);
                data.posts[postIndex].collectCount = Math.max(0, (data.posts[postIndex].collectCount || 0) - 1);
            } else {
                interactions.collectedPosts.push(postId);
                data.posts[postIndex].collectCount = (data.posts[postIndex].collectCount || 0) + 1;
            }
            
            data.userInteractions[userId] = interactions;
            setStorage(data);
            return { collected: collectedIndex === -1, count: data.posts[postIndex].collectCount };
        },

        toggleFollowTopic: function(topicId, userId) {
            var data = getData();
            var interactions = this.getUserInteractions(userId);
            var topicIndex = data.topics.findIndex(function(t) { return t.id === topicId; });
            if (topicIndex === -1) return null;
            
            var followedIndex = interactions.followedTopics.indexOf(topicId);
            if (followedIndex > -1) {
                interactions.followedTopics.splice(followedIndex, 1);
                data.topics[topicIndex].followCount = Math.max(0, (data.topics[topicIndex].followCount || 0) - 1);
            } else {
                interactions.followedTopics.push(topicId);
                data.topics[topicIndex].followCount = (data.topics[topicIndex].followCount || 0) + 1;
            }
            
            data.userInteractions[userId] = interactions;
            setStorage(data);
            return { followed: followedIndex === -1, count: data.topics[topicIndex].followCount };
        },

        incrementViewCount: function(postId) {
            var data = getData();
            var postIndex = data.posts.findIndex(function(p) { return p.id === postId; });
            if (postIndex === -1) return;
            
            data.posts[postIndex].viewCount = (data.posts[postIndex].viewCount || 0) + 1;
            setStorage(data);
        },

        incrementShareCount: function(postId) {
            var data = getData();
            var postIndex = data.posts.findIndex(function(p) { return p.id === postId; });
            if (postIndex === -1) return;
            
            data.posts[postIndex].shareCount = (data.posts[postIndex].shareCount || 0) + 1;
            setStorage(data);
        },

        addReport: function(report) {
            var data = getData();
            if (!data.reportRecords) data.reportRecords = [];
            
            var newReport = {
                id: generateId(),
                type: report.type,
                targetId: report.targetId,
                targetType: report.targetType,
                reason: report.reason,
                description: report.description,
                reporter: report.reporter,
                status: 'pending',
                createTime: Date.now(),
                handleTime: null,
                handler: null,
                result: null
            };
            
            data.reportRecords.push(newReport);
            setStorage(data);
            return newReport;
        },

        getReports: function(filters) {
            var data = getData();
            var reports = data.reportRecords || [];
            
            if (filters) {
                if (filters.status) {
                    reports = reports.filter(function(r) { return r.status === filters.status; });
                }
                if (filters.type) {
                    reports = reports.filter(function(r) { return r.type === filters.type; });
                }
            }
            
            return reports.sort(function(a, b) { return b.createTime - a.createTime; });
        },

        handleReport: function(reportId, result, handler) {
            var data = getData();
            var index = data.reportRecords.findIndex(function(r) { return r.id === reportId; });
            if (index === -1) return null;
            
            data.reportRecords[index].status = 'handled';
            data.reportRecords[index].handleTime = Date.now();
            data.reportRecords[index].handler = handler;
            data.reportRecords[index].result = result;
            
            if (result.action === 'delete') {
                if (data.reportRecords[index].targetType === 'post') {
                    this.deletePost(data.reportRecords[index].targetId, handler);
                } else if (data.reportRecords[index].targetType === 'comment') {
                    this.deleteComment(data.reportRecords[index].targetId);
                }
            } else if (result.action === 'hide') {
                if (data.reportRecords[index].targetType === 'comment') {
                    var commentIndex = data.comments.findIndex(function(c) { return c.id === data.reportRecords[index].targetId; });
                    if (commentIndex !== -1) {
                        data.comments[commentIndex].status = 'hidden';
                    }
                }
            }
            
            setStorage(data);
            return data.reportRecords[index];
        },

        getStats: function() {
            var data = getData();
            var posts = data.posts || [];
            var comments = data.comments || [];
            var reports = data.reportRecords || [];
            
            return {
                totalPosts: posts.length,
                publishedPosts: posts.filter(function(p) { return p.status === 'published'; }).length,
                totalComments: comments.length,
                totalViews: posts.reduce(function(sum, p) { return sum + (p.viewCount || 0); }, 0),
                totalLikes: posts.reduce(function(sum, p) { return sum + (p.likeCount || 0); }, 0),
                pendingReports: reports.filter(function(r) { return r.status === 'pending'; }).length,
                todayPosts: posts.filter(function(p) {
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return p.createTime >= today.getTime();
                }).length
            };
        },

        getAuditLogs: function(limit) {
            var data = getData();
            var logs = data.auditLogs || [];
            return logs.sort(function(a, b) { return b.time - a.time; }).slice(0, limit || 100);
        }
    };

    var Service = {
        createPost: function(postData, author) {
            var errors = validatePost(postData);
            if (errors.length > 0) {
                return { success: false, errors: errors };
            }
            
            var sensitiveFound = containsSensitiveWords(postData.title + ' ' + postData.content);
            if (sensitiveFound.length > 0) {
                return { success: false, errors: ['内容包含敏感词：' + sensitiveFound.join('、')] };
            }
            
            var post = Database.addPost({
                title: postData.title,
                content: postData.content,
                summary: postData.summary,
                categoryId: postData.categoryId,
                topicIds: postData.topicIds,
                tags: postData.tags,
                author: author,
                district: postData.district
            });
            
            return { success: true, post: post };
        },

        updatePost: function(postId, updates, operator) {
            updates.operator = operator;
            var post = Database.updatePost(postId, updates);
            return post ? { success: true, post: post } : { success: false, error: '帖子不存在' };
        },

        deletePost: function(postId, operator) {
            var result = Database.deletePost(postId, operator);
            return result ? { success: true } : { success: false, error: '帖子不存在' };
        },

        getPostDetail: function(postId, userId) {
            var post = Database.getPostById(postId);
            if (!post) return null;
            
            Database.incrementViewCount(postId);
            post = Database.getPostById(postId);
            
            var interactions = userId ? Database.getUserInteractions(userId) : null;
            var category = Database.getCategoryById(post.categoryId);
            
            return {
                post: post,
                category: category,
                isLiked: interactions ? interactions.likedPosts.indexOf(postId) > -1 : false,
                isCollected: interactions ? interactions.collectedPosts.indexOf(postId) > -1 : false
            };
        },

        getPostList: function(filters, sortBy, userId) {
            var posts = Database.getPosts(filters);
            
            switch (sortBy) {
                case 'latest':
                    posts.sort(function(a, b) { return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0) || b.createTime - a.createTime; });
                    break;
                case 'hot':
                    posts.sort(function(a, b) { return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0) || (b.viewCount + b.likeCount * 2 + b.commentCount * 3) - (a.viewCount + a.likeCount * 2 + a.commentCount * 3); });
                    break;
                case 'essence':
                    posts = posts.filter(function(p) { return p.isEssence; });
                    posts.sort(function(a, b) { return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0) || b.createTime - a.createTime; });
                    break;
                default:
                    posts.sort(function(a, b) { return (b.isTop ? 1 : 0) - (a.isTop ? 1 : 0) || b.createTime - a.createTime; });
            }
            
            if (userId) {
                var interactions = Database.getUserInteractions(userId);
                posts = posts.map(function(p) {
                    p.isLiked = interactions.likedPosts.indexOf(p.id) > -1;
                    p.isCollected = interactions.collectedPosts.indexOf(p.id) > -1;
                    return p;
                });
            }
            
            return posts;
        },

        createComment: function(commentData, author) {
            if (!commentData.content || commentData.content.trim().length < 2) {
                return { success: false, error: '评论内容至少需要2个字符' };
            }
            
            var sensitiveFound = containsSensitiveWords(commentData.content);
            if (sensitiveFound.length > 0) {
                return { success: false, error: '评论包含敏感词' };
            }
            
            var post = Database.getPostById(commentData.postId);
            var isAuthorReply = post && post.author.id === author.id;
            
            var comment = Database.addComment({
                postId: commentData.postId,
                parentId: commentData.parentId,
                content: commentData.content,
                author: author,
                isAuthorReply: isAuthorReply
            });
            
            return { success: true, comment: comment };
        },

        deleteComment: function(commentId) {
            var result = Database.deleteComment(commentId);
            return result ? { success: true } : { success: false, error: '评论不存在' };
        },

        getComments: function(postId, userId) {
            var comments = Database.getComments(postId, { status: 'normal' });
            
            if (userId) {
                var interactions = Database.getUserInteractions(userId);
                comments = comments.map(function(c) {
                    c.isLiked = interactions.likedComments.indexOf(c.id) > -1;
                    return c;
                });
            }
            
            return this.buildCommentTree(comments);
        },

        buildCommentTree: function(comments) {
            var rootComments = comments.filter(function(c) { return !c.parentId; });
            var repliesMap = {};
            
            comments.forEach(function(c) {
                if (c.parentId) {
                    if (!repliesMap[c.parentId]) repliesMap[c.parentId] = [];
                    repliesMap[c.parentId].push(c);
                }
            });
            
            rootComments.forEach(function(c) {
                c.replies = (repliesMap[c.id] || []).slice(0, 3);
            });
            
            return rootComments;
        },

        toggleLike: function(type, targetId, userId) {
            if (type === 'post') {
                return Database.toggleLikePost(targetId, userId);
            } else if (type === 'comment') {
                return Database.toggleLikeComment(targetId, userId);
            }
            return null;
        },

        toggleCollect: function(postId, userId) {
            return Database.toggleCollectPost(postId, userId);
        },

        toggleFollowTopic: function(topicId, userId) {
            return Database.toggleFollowTopic(topicId, userId);
        },

        sharePost: function(postId) {
            Database.incrementShareCount(postId);
            return { success: true };
        },

        reportContent: function(reportData, reporter) {
            var report = Database.addReport({
                type: reportData.type,
                targetId: reportData.targetId,
                targetType: reportData.targetType,
                reason: reportData.reason,
                description: reportData.description,
                reporter: reporter
            });
            
            return { success: true, report: report };
        },

        getPendingReports: function() {
            return Database.getReports({ status: 'pending' });
        },

        handleReport: function(reportId, result, handler) {
            var report = Database.handleReport(reportId, result, handler);
            return report ? { success: true, report: report } : { success: false, error: '举报记录不存在' };
        },

        getStats: function() {
            return Database.getStats();
        },

        getCategories: function() {
            return Database.getCategories();
        },

        getHotTopics: function(limit) {
            return Database.getHotTopics(limit);
        },

        searchPosts: function(keyword, userId) {
            return this.getPostList({ keyword: keyword, status: 'published' }, 'latest', userId);
        },

        getCollectedPosts: function(userId) {
            var interactions = Database.getUserInteractions(userId);
            var posts = Database.getPosts();
            return posts.filter(function(p) {
                return interactions.collectedPosts.indexOf(p.id) > -1;
            });
        },

        setPostTop: function(postId, isTop, operator) {
            return this.updatePost(postId, { isTop: isTop }, operator);
        },

        setPostEssence: function(postId, isEssence, operator) {
            return this.updatePost(postId, { isEssence: isEssence }, operator);
        },

        formatDate: function(timestamp) {
            if (!timestamp) return '';
            var date = new Date(timestamp);
            var now = new Date();
            var diff = now - date;
            
            if (diff < 60000) return '刚刚';
            if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
            if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
            if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
            
            var year = date.getFullYear();
            var month = String(date.getMonth() + 1).padStart(2, '0');
            var day = String(date.getDate()).padStart(2, '0');
            return year + '-' + month + '-' + day;
        },

        formatNumber: function(num) {
            if (num >= 10000) {
                return (num / 10000).toFixed(1) + '万';
            }
            return num.toString();
        }
    };

    window.CommunityForum = {
        Database: Database,
        Service: Service,
        init: function() {
            return getData();
        }
    };

})(window);
