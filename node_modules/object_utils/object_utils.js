/**
 * @class node_modules.object_utils
 * 
 * @author Marcello Gesmundo
 * 
 * This module provide some utilities for object manipulation. It can used
 * both in Node and in browser.
 * 
 * # License
 * 
 * Copyright (c) 2012-2013 Yoovant by Marcello Gesmundo. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * 
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 *      copyright notice, this list of conditions and the following
 *      disclaimer in the documentation and/or other materials provided
 *      with the distribution.
 *    * Neither the name of Yoovant nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *      
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
(function(exports) {
    var ObjectUtils = exports;
    
    /**
     * Return true if obj1 === obj2 comparing all values of all properties
     */
    ObjectUtils.equals = function (obj1, obj2) {
        if (!obj1 || !obj2) {
            return false;
        }
        var p;
        for(p in obj1) {
            if (obj1.hasOwnProperty(p)) {
                if(obj2[p]==='undefined') {
                    return false;
                }
            }
        }
        for(p in obj1) {
            if (obj1.hasOwnProperty(p)) {
                if (obj1[p]) {
                    switch (typeof(obj1[p])) {
                        case 'object':
                            if (!this.equals(obj1[p], obj2[p])) {
                                return false;
                            }
                            break;
                        case 'function':
                            if (obj2[p]==='undefined' || (p !== 'equals' && obj1[p].toString() !== obj2[p].toString())) {
                                return false;
                            }
                            break;
                        default:
                            if (obj1[p] !== obj2[p]) {
                                return false;
                            }
                    }
                } else {
                    if (obj2[p]) {
                        return false;
                    }
                }
            }
        }

        for(p in obj2) {
            if (obj2.hasOwnProperty(p)) {
                if(obj1[p]==='undefined') {
                    return false;
                }
            }
        }

        return true;
    };
    
    /**
     * Alias for #equals
     * @method
     */
    ObjectUtils.equal = ObjectUtils.equals;

    /**
     * Merge obj2 properties with all obj1 properties
     * @param {Object} obj1 First object
     * @param {Object} obj2 Second object
     * @return {Object} Return obj1 with all new obj2 properties and
     * obj1 properties updated with correspondents obj2 properties
     */
    ObjectUtils.merge = function (obj1, obj2) {
        if (obj2) {
            var key, value;

            for (key in obj2) {
                if (obj2.hasOwnProperty(key)) {
                    value = obj2[key];
                    try {
                        if ( value.constructor === Object ) {
                            obj1[key] = ObjectUtils.merge(obj1[key], value);
                        } else {
                            obj1[key] = value;
                        }
                    } catch(e) {
                        obj1[key] = value;
                    }
                }
            }
        }

        return obj1;
    };

    /**
     * Return true if the object is null or undefined
     * @param {Object} obj Object to check
     */
    ObjectUtils.isNull = function (obj) {
        return (!obj || obj === 'undefined' || obj === 'null');
    };
    
}('object' === typeof module ? module.exports : (this.ObjectUtils = {})));
