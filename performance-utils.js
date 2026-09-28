/**
 * 物业端性能优化工具
 * 包含：localStorage优化、虚拟滚动、防抖节流、缓存策略
 */
(function (global) {
  'use strict';

  var PerformanceUtils = {
    cache: {},
    cacheExpiry: {},
    defaultExpiry: 5 * 60 * 1000,

    throttle: function (func, limit) {
      var inThrottle;
      var lastFunc;
      var lastRan;
      return function () {
        var context = this;
        var args = arguments;
        if (!inThrottle) {
          func.apply(context, args);
          lastRan = Date.now();
          inThrottle = true;
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(function () {
            if (Date.now() - lastRan >= limit) {
              func.apply(context, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    },

    debounce: function (func, wait, immediate) {
      var timeout;
      return function () {
        var context = this;
        var args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },

    setCache: function (key, value, expiry) {
      this.cache[key] = value;
      this.cacheExpiry[key] = Date.now() + (expiry || this.defaultExpiry);
    },

    getCache: function (key) {
      if (this.cache[key] && this.cacheExpiry[key]) {
        if (Date.now() < this.cacheExpiry[key]) {
          return this.cache[key];
        } else {
          delete this.cache[key];
          delete this.cacheExpiry[key];
        }
      }
      return null;
    },

    clearCache: function (key) {
      if (key) {
        delete this.cache[key];
        delete this.cacheExpiry[key];
      } else {
        this.cache = {};
        this.cacheExpiry = {};
      }
    },

    safeLocalStorage: {
      get: function (key) {
        try {
          var item = localStorage.getItem(key);
          if (!item) return null;
          var parsed = JSON.parse(item);
          if (parsed.expiry && Date.now() > parsed.expiry) {
            localStorage.removeItem(key);
            return null;
          }
          return parsed.value;
        } catch (e) {
          return null;
        }
      },

      set: function (key, value, expiry) {
        try {
          var item = {
            value: value,
            expiry: expiry ? Date.now() + expiry : null,
            timestamp: Date.now()
          };
          localStorage.setItem(key, JSON.stringify(item));
          return true;
        } catch (e) {
          if (e.name === 'QuotaExceededError') {
            this.cleanup();
            try {
              localStorage.setItem(key, JSON.stringify(item));
              return true;
            } catch (e2) {
              return false;
            }
          }
          return false;
        }
      },

      remove: function (key) {
        try {
          localStorage.removeItem(key);
          return true;
        } catch (e) {
          return false;
        }
      },

      cleanup: function () {
        try {
          var keysToRemove = [];
          var prefix = 'sgzf_';
          for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.indexOf(prefix) === 0) {
              try {
                var item = JSON.parse(localStorage.getItem(key));
                if (item.expiry && Date.now() > item.expiry) {
                  keysToRemove.push(key);
                }
              } catch (e) {
                keysToRemove.push(key);
              }
            }
          }
          keysToRemove.forEach(function (key) {
            localStorage.removeItem(key);
          });
          return keysToRemove.length;
        } catch (e) {
          return 0;
        }
      },

      getSize: function () {
        try {
          var total = 0;
          for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.indexOf('sgzf_') === 0) {
              total += localStorage.getItem(key).length * 2;
            }
          }
          return total;
        } catch (e) {
          return 0;
        }
      }
    },

    VirtualScroll: function (options) {
      var container = options.container;
      var itemHeight = options.itemHeight || 50;
      var visibleCount = options.visibleCount || 20;
      var buffer = options.buffer || 5;
      var renderItem = options.renderItem;
      var data = options.data || [];

      var scrollTop = 0;
      var startIndex = 0;
      var endIndex = visibleCount;
      var wrapper = null;
      var content = null;

      function init() {
        if (!container) return;
        container.style.overflowY = 'auto';
        container.style.position = 'relative';

        wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.minHeight = (data.length * itemHeight) + 'px';

        content = document.createElement('div');
        content.style.position = 'absolute';
        content.style.top = '0';
        content.style.left = '0';
        content.style.right = '0';

        wrapper.appendChild(content);
        container.innerHTML = '';
        container.appendChild(wrapper);

        container.addEventListener('scroll', PerformanceUtils.throttle(onScroll, 16));
        render();
      }

      function onScroll() {
        scrollTop = container.scrollTop;
        render();
      }

      function render() {
        var newStartIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        var newEndIndex = Math.min(data.length, newStartIndex + visibleCount + buffer * 2);

        if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
          startIndex = newStartIndex;
          endIndex = newEndIndex;
          renderItems();
        }
      }

      function renderItems() {
        content.innerHTML = '';
        content.style.top = (startIndex * itemHeight) + 'px';

        for (var i = startIndex; i < endIndex; i++) {
          if (data[i]) {
            var item = renderItem(data[i], i);
            if (item) {
              item.style.position = 'absolute';
              item.style.top = ((i - startIndex) * itemHeight) + 'px';
              item.style.height = itemHeight + 'px';
              item.style.left = '0';
              item.style.right = '0';
              content.appendChild(item);
            }
          }
        }
      }

      function updateData(newData) {
        data = newData || [];
        if (wrapper) {
          wrapper.style.minHeight = (data.length * itemHeight) + 'px';
        }
        startIndex = 0;
        endIndex = visibleCount;
        renderItems();
      }

      function scrollToIndex(index) {
        if (container) {
          container.scrollTop = index * itemHeight;
        }
      }

      return {
        init: init,
        updateData: updateData,
        scrollToIndex: scrollToIndex,
        render: render
      };
    },

    lazyLoadImages: function (container) {
      var images = container ? container.querySelectorAll('img[data-src]') : document.querySelectorAll('img[data-src]');
      
      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var img = entry.target;
              if (img.getAttribute('data-src')) {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                observer.unobserve(img);
              }
            }
          });
        }, { rootMargin: '50px' });

        images.forEach(function (img) {
          observer.observe(img);
        });
      } else {
        images.forEach(function (img) {
          if (img.getAttribute('data-src')) {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
          }
        });
      }
    },

    measurePerformance: function (name, callback) {
      var start = performance.now();
      var result = callback();
      var end = performance.now();
      console.log('[Performance] ' + name + ': ' + (end - start).toFixed(2) + 'ms');
      return result;
    },

    measureAsync: function (name, promise) {
      var start = performance.now();
      return promise.then(function (result) {
        var end = performance.now();
        console.log('[Performance] ' + name + ': ' + (end - start).toFixed(2) + 'ms');
        return result;
      });
    },

    getMemoryUsage: function () {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usedMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
          totalMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
        };
      }
      return null;
    },

    optimizeTable: function (tableId, options) {
      var table = document.getElementById(tableId);
      if (!table) return null;

      options = options || {};
      var pageSize = options.pageSize || 50;
      var data = options.data || [];
      var columns = options.columns || [];
      var currentPage = 0;
      var sortColumn = null;
      var sortDirection = 'asc';

      function renderPage() {
        var tbody = table.querySelector('tbody');
        if (!tbody) return;

        var start = currentPage * pageSize;
        var end = Math.min(start + pageSize, data.length);
        var pageData = data.slice(start, end);

        tbody.innerHTML = '';
        pageData.forEach(function (row, index) {
          var tr = document.createElement('tr');
          columns.forEach(function (col) {
            var td = document.createElement('td');
            td.textContent = row[col.key] || '';
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });

        PerformanceUtils.lazyLoadImages(tbody);
      }

      function sort(column) {
        if (sortColumn === column) {
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          sortColumn = column;
          sortDirection = 'asc';
        }

        data.sort(function (a, b) {
          var valA = a[column] || '';
          var valB = b[column] || '';
          if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
          if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });

        currentPage = 0;
        renderPage();
      }

      function goToPage(page) {
        var maxPage = Math.ceil(data.length / pageSize) - 1;
        currentPage = Math.max(0, Math.min(page, maxPage));
        renderPage();
      }

      function updateData(newData) {
        data = newData || [];
        currentPage = 0;
        renderPage();
      }

      return {
        renderPage: renderPage,
        sort: sort,
        goToPage: goToPage,
        updateData: updateData,
        getCurrentPage: function () { return currentPage; },
        getTotalPages: function () { return Math.ceil(data.length / pageSize); }
      };
    }
  };

  global.PerformanceUtils = PerformanceUtils;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceUtils;
  }
})(typeof window !== 'undefined' ? window : this);
