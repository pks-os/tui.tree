tui.util.defineNamespace("fedoc.content", {});
fedoc.content["util.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Helper object to make easy tree elements\n * @author NHN Ent. FE dev team.&lt;dl_javascript@nhnent.com>\n */\n'use strict';\nvar isUndefined = tui.util.isUndefined,\n    pick = tui.util.pick,\n    templateMaskRe = /\\{\\{(.+?)}}/gi,\n    isValidDotNotationRe = /^\\w+(?:\\.\\w+)*$/,\n    isValidDotNotation = function(str) {\n        return isValidDotNotationRe.test(str);\n    },\n    isArray = tui.util.isArraySafe,\n    isSupportPageOffset = typeof window.pageXOffset !== 'undefined',\n    isCSS1Compat = document.compatMode === 'CSS1Compat';\n\nvar util = {\n    /**\n     * Remove first specified item from array, if it exists\n     * @param {*} item Item to look for\n     * @param {Array} arr Array to query\n     */\n    removeItemFromArray: function(item, arr) {\n        var index = arr.length - 1;\n\n        while (index > -1) {\n            if (item === arr[index]) {\n                arr.splice(index, 1);\n            }\n            index -= 1;\n        }\n    },\n\n    /**\n     * Add classname\n     * @param {HTMLElement} element - Target element\n     * @param {string} className - Classname\n     */\n    addClass: function(element, className) {\n        if (!element) {\n            return;\n        }\n\n        if (element.className === '') {\n            element.className = className;\n        } else if (!util.hasClass(element, className)) {\n            element.className += ' ' + className;\n        }\n    },\n\n    /**\n     * Remove classname\n     * @param {HTMLElement} element - Target element\n     * @param {string} className - Classname\n     */\n    removeClass: function(element, className) {\n        var originalClassName = util.getClass(element),\n            arr, index;\n\n        if (!originalClassName) {\n            return;\n        }\n\n        arr = originalClassName.split(' ');\n        index = tui.util.inArray(className, arr);\n        if (index !== -1) {\n            arr.splice(index, 1);\n            element.className = arr.join(' ');\n        }\n    },\n\n\n    /**\n     * Add event to element\n     * @param {Object} element A target element\n     * @param {String} eventName A name of event\n     * @param {Function} handler A callback function to add\n     */\n    addEventListener: function(element, eventName, handler) {\n        if (element.addEventListener) {\n            element.addEventListener(eventName, handler, false);\n        } else {\n            element.attachEvent('on' + eventName, handler);\n        }\n    },\n\n    /**\n     * Remove event from element\n     * @param {Object} element A target element\n     * @param {String} eventName A name of event\n     * @param {Function} handler A callback function to remove\n     */\n    removeEventListener: function(element, eventName, handler) {\n        if (element.removeEventListener) {\n            element.removeEventListener(eventName, handler, false);\n        } else {\n            element.detachEvent('on' + eventName, handler);\n        }\n    },\n\n    /**\n     * Get target element\n     * @param {Event} e Event object\n     * @returns {HTMLElement} Event target\n     */\n    getTarget: function(e) {\n        var target;\n        e = e || window.event;\n        target = e.target || e.srcElement;\n\n        return target;\n    },\n\n    /**\n     * Get class name\n     * @param {HTMLElement} element HTMLElement\n     * @returns {string} Class name\n     */\n    getClass: function(element) {\n        return element &amp;&amp; element.getAttribute &amp;&amp;\n            (element.getAttribute('class') || element.getAttribute('className') || '');\n    },\n\n    /**\n     * Check the element has specific class or not\n     * @param {HTMLElement} element A target element\n     * @param {string} className A name of class to find\n     * @returns {boolean} Whether the element has the class\n     */\n    hasClass: function(element, className) {\n        var elClassName = util.getClass(element);\n\n        return elClassName.indexOf(className) > -1;\n    },\n\n    /**\n     * Find element by class name\n     * @param {HTMLElement} target A target element\n     * @param {string} className A name of class\n     * @returns {Array.&lt;HTMLElement>} Elements\n     */\n    getElementsByClassName: function(target, className) {\n        var all, filtered;\n\n        if (target.querySelectorAll) {\n            filtered = target.querySelectorAll('.' + className);\n        } else {\n            all = tui.util.toArray(target.getElementsByTagName('*'));\n            filtered = tui.util.filter(all, function(el) {\n                var classNames = el.className || '';\n\n                return (classNames.indexOf(className) !== -1);\n            });\n        }\n\n        return filtered;\n    },\n\n    /**\n     * Check whether the click event by right button\n     * @param {MouseEvent} event Event object\n     * @returns {boolean} Whether the click event by right button\n     */\n    isRightButton: function(event) {\n        return util._getButton(event) === 2;\n    },\n\n    /**\n     * Whether the property exist or not\n     * @param {Array} props A property\n     * @returns {string|boolean} Property name or false\n     * @example\n     * var userSelectProperty = util.testProp([\n     *     'userSelect',\n     *     'WebkitUserSelect',\n     *     'OUserSelect',\n     *     'MozUserSelect',\n     *     'msUserSelect'\n     * ]);\n     */\n    testProp: function(props) {\n        var style = document.documentElement.style,\n            propertyName = false;\n\n        /* eslint-disable consistent-return */\n        tui.util.forEach(props, function(prop) {\n            if (prop in style) {\n                propertyName = prop;\n\n                return false;\n            }\n        });\n        /* eslint-enable consistent-return */\n\n        return propertyName;\n    },\n\n    /**\n     * Prevent default event\n     * @param {Event} event Event object\n     */\n    preventDefault: function(event) {\n        if (event.preventDefault) {\n            event.preventDefault();\n        } else {\n            event.returnValue = false;\n        }\n    },\n\n    /**\n     * Make html from template\n     * @param {string} source - Template html\n     * @param {Object} props - Template data\n     * @returns {string} html\n     */\n    renderTemplate: function(source, props) {\n        function pickValue(names) {\n            return pick.apply(null, [props].concat(names));\n        }\n\n        return source.replace(templateMaskRe, function(match, name) {\n            var value;\n\n            if (isValidDotNotation(name)) {\n                value = pickValue(name.split('.'));\n            }\n\n            if (isArray(value)) {\n                value = value.join(' ');\n            } else if (isUndefined(value)) {\n                value = '';\n            }\n\n            return value;\n        });\n    },\n\n    /**\n     * Normalization for event button property\n     * 0: First mouse button, 2: Second mouse button, 1: Center button\n     * @param {MouseEvent} event Event object\n     * @returns {?number} button type\n     * @private\n     */\n    _getButton: function(event) {\n        var button,\n            primary = '0,1,3,5,7',\n            secondary = '2,6',\n            wheel = '4';\n\n        if (document.implementation.hasFeature('MouseEvents', '2.0')) {\n            return event.button;\n        }\n\n        button = String(event.button);\n        if (primary.indexOf(button) > -1) {\n            return 0;\n        } else if (secondary.indexOf(button) > -1) {\n            return 2;\n        } else if (wheel.indexOf(button) > -1) {\n            return 1;\n        }\n\n        return null;\n    },\n\n    /**\n     * Get mouse position\n     * @param {MouseEvet} event - Event object\n     * @returns {object} X, Y position of mouse\n     */\n    getMousePos: function(event) {\n        return {\n            x: event.clientX,\n            y: event.clientY\n        };\n    },\n\n    /**\n     * Get value of scroll top on document.body (cross browsing)\n     * @returns {number} Value of scroll top\n     */\n    getWindowScrollTop: function() {\n        var scrollTop;\n\n        if (isSupportPageOffset) {\n            scrollTop = window.pageYOffset;\n        } else {\n            scrollTop = isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;\n        }\n\n        return scrollTop;\n    }\n};\n\nmodule.exports = util;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"