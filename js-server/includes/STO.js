/*********************************************************
 * The STO.js namespace contains 3 things
 * Definition of namespacing
 * inheritance: extends
 *
 *********************************************************/

(function () {
    /*****************
     * Definition
     *****************/
    var STO = {};
    var root = this; //window or global space.
    var previous_STO;

    if (root != null) {
        previous_STO = root.STO;
    }
    STO.noConflict = function () {
        root.STO = previous_STO;
        return STO;
    };

    /*****************
     * Globals
     *****************/
    STO.API_VERSION = "v1";


    /*************************************************************************
     * Declares a namespace, given a namespace name as an argument
     * Modelled after YUI namespace declaration
     *
     * The Convention is that Namespaces are UPPERCASE or TitleCase but not
     * lowercase.
     *
     * The format of any Javascript file(namespace) should be as shown below.
     *
     * Format 1:
     * ---------
     * This first example assumes that your code has public as well as private members.
     *
     * STO.namespace("STO.x.y");
     * function($){
     *    var privateVariable = ...;
     *    $.publicFunction = function(){
     *    }
     *    $.publicVariable = 12345;
     * }(STO.x.y);
     *
     * Format 2:
     * ---------
     * If your Namespace Does not have private members,
     * (or does not include any complex interdependent expressions) just
     * declare your members in a simple way, as follows.
     *
     * STO.namespace("SIS.x.y");
     * STO.x.y.publicFunction = function(){
     *   .....
     * }
     *
     * @param list of namespaces to be created
     * @returns {null}
     ***************************************************************************/
    STO.namespace = function () {
        "use strict";
        var a = arguments;
        for (var i = 0; i < a.length; i = i + 1) {
            // console.log("STO.namespace defining: "+a[i]);
            var d = a[i].split(".");
            var o = root.STO;
            var s = (d[0] === "STO") ? 1 : 0;
            var n = "STO";
            for (var j = s; j < d.length; j = j + 1) {
                n = n + "." + d[j];
                o[d[j]] = o[d[j]] ||
                /**
                 * This is the real definition of a namespaced object
                 */
                    (function (ns) {
                        var _parent; //parent of the name space
                        var _nsName = n; //name space name
                        ns.extend = STO.extend;
                        ns.getChildren = function () {
                            return STO.getChildren(ns)
                        };
                        ns.setParent = function (p) {
                            _parent = p;
                        };
                        ns.getNSName = function () {
                            return _nsName;
                        };
                        ns.toString = function () {
                            return _nsName;
                        };
                        ns.isNamespace = true;
                        /**
                         * Returns ths parent if no arguments are passed
                         * Else, returns property from parent.
                         *
                         * Some interpreters do not like "parent"
                         * @param propertyName
                         * @returns {*}
                         */
                        ns.parent = function (propertyName) {
                            if (propertyName) {
                                return _parent[propertyName];
                            }
                            return _parent;
                        };
                        return ns;
                    })({});
                o[d[j]].setParent(o);
                o = o[d[j]];
            }
        }
        return o;
    },
        //Manually declare the other functions
        setParent = function () {
            //This basically gets ignored
            //Parent of STO is _ST_GLOBAL_.
        };
    STO.isNamespace = true,
        STO.getNSName = function () {
            return "STO";
        };
    STO.toString = function () {
        return "STO";
    };
    STO.parent = function (propertyName) {
        return propertyName ? _ST_GLOBAL_[propertyName] : _ST_GLOBAL_;
    };
    STO.getChildren = function (me) {
        var result = [];
        me = me || this;
        for (var k in me) {
            if (me[k] && me[k].isNamespace) {
                var addChild = true;
                //add unique
                for (var rKey in result) {
                    if (result[rKey] === me[k]) addChild = false;
                }
                if (addChild) {
                    result.push(me[k]);
                }
            }
        }
        return result === [] ? undefined : result;
    };

    /*************************************************************************
     * Recursively deep copies properties from parent to child,
     * while following rules of classical inheritance
     * The "extend" function also sets up access to the parent
     * via use of
     *
     *  parent() // returns the parent object
     *  parent(propertyName) //essentially returns parent()[propertyName]
     *
     * So e.g. if the child class has a method called methodX() and the parent has the same method
     * and within methodX, you want to call the parent's function.
     *
     * ns.methodX = function( arg1, arg2) {
     *          this.base(arg1,arg2)
     * }
     *
     *  [[ NOTE ]]   if you wish to use the "base()" function,s make sure that "extend" is called
     *              AFTER the object is created.
     *  (function(ns){
     *         ns.x = function(o){
     *             this.base(o);
     *         }
     *   })("child");
     *  child.extend(parent); //Its critical that "extends" is aware of "parent.x"
     *
     *
     * @param child  The child object
     * @param parent  The parent object
     * @param override if true, forces the methods to be copied from parent to child, ignoring the rules of classical inheritance
     * @returns {*}
     *************************************************************************/
    STO.extend = function (c, p, o) {
        "use strict";
        var _BASE_ = 'base';
        var override = false;
        var child;
        var parent;
        //figure out what the parent and child objects are..
        //if the child is not specified.. then child is "this"
        if (arguments.length > 2) {
            child = c;
            parent = p;
            override = ((typeof arguments[2]) === "boolean") ? o : override;
        }
        if (arguments.length == 2) {
            if ((typeof arguments[1]) === "boolean") {
                child = this;
                parent = c;
                override = p;
            } else {
                child = c;
                parent = p;
            }
        }
        if (arguments.length == 1) {
            child = this;
            parent = c;
        }
        if (!child || !parent) {
            throw new Error("Insufficient arguments for extend");
        }
        if (!(typeof child === "object") || !(typeof parent === "object")) {
            console.warn("Both child and parent must be objects, naughty, naughty");
            return child;
        }
        if (child === parent) {
            console.warn("Child and parent are the same, naughty, naughty");
            return;
        }

        //All error conditions have been checked.
        //Now for the fun part
        var property;
        for (property in parent) {
            if (property in child) {
                if (override) {
                    // OVERRIDE IS VERY DANGEROUS
                    // It Wipes Out everything
                    // And it goes deep
                    var to = child[property];
                    var from = parent[property];
                    var temp;
                    if (Array.isArray(from)) {
                        temp = (to && Array.isArray(to)) ? to : [];
                        child[property] = e(temp, from, override);
                    } else if (typeof from === "object") {
                        temp = (to && ((typeof to) === "object")) ? to : {};
                        child[property] = e(temp, from, override);
                    } else {
                        child[property] = parent[property];
                    }
                } else {
                    //OK, so the property exists in both parent and child
                    //"override" is false..so usually the child's property will take precedence.
                    var to = child[property];
                    var from = parent[property];
                    if ((typeof to === "function") && (typeof from === "function")) {
                        if (Object.keys(STO).indexOf(property) === -1) {
                            //But if the property is a function, the child needs to have a way of calling the parent
                            //we setup a closure, and a function called "base" that can be used to call the parent.
                            var assignBase = function (t, f) {
                                // if the child function calls base(), they will in essence be calling the parent's function
                                return function () {
                                    var temp = this[_BASE_] ? this[_BASE_] : undefined;
                                    this[_BASE_] = f;
                                    var result = t.apply(this, arguments);
                                    if (temp) {
                                        this[_BASE_] = temp;
                                    }
                                    return result;
                                };
                            };
                            child[property] = assignBase(to, from);
                        }
                    }
                }
            } else {
                //kill circular references
                if (!(child === parent[property]) && !(typeof parent[property] === "object" && parent[property].isNamespace)) {
                    child[property] = parent[property];
                }
            }
        }
        child.setParent(parent);
        return child;
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = STO;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return STO;
        });
    }
    // Always creates a global object called STO
    root.STO = STO; //i realize this is not kosher. But i want a global object.
}());
