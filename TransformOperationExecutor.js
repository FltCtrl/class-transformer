"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var storage_1 = require("./storage");
var TransformOperationExecutor = (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function TransformOperationExecutor(transformationType, options) {
        this.transformationType = transformationType;
        this.options = options;
        // -------------------------------------------------------------------------
        // Private Properties
        // -------------------------------------------------------------------------
        this.transformedTypes = [];
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    TransformOperationExecutor.prototype.transform = function (source, value, targetType, arrayType, isMap, level) {
        var _this = this;
        if (level === void 0) { level = 0; }
        if (value instanceof Array || value instanceof Set) {
            var newValue_1 = arrayType && this.transformationType === "plainToClass" ? new arrayType() : [];
            value.forEach(function (subValue, index) {
                var subSource = source ? source[index] : undefined;
                if (!_this.isCircular(subValue, level)) {
                    var value_1 = _this.transform(subSource, subValue, targetType, undefined, subValue instanceof Map, level + 1);
                    if (newValue_1 instanceof Set) {
                        newValue_1.add(value_1);
                    }
                    else {
                        newValue_1.push(value_1);
                    }
                }
                else if (_this.transformationType === "classToClass") {
                    if (newValue_1 instanceof Set) {
                        newValue_1.add(subValue);
                    }
                    else {
                        newValue_1.push(subValue);
                    }
                }
            });
            return newValue_1;
        }
        else if (targetType === String && !isMap) {
            return String(value);
        }
        else if (targetType === Number && !isMap) {
            return Number(value);
        }
        else if (targetType === Boolean && !isMap) {
            return Boolean(value);
        }
        else if ((targetType === Date || value instanceof Date) && !isMap) {
            if (value instanceof Date) {
                return new Date(value.valueOf());
            }
            if (value === null || value === undefined)
                return value;
            return new Date(value);
        }
        else if (value instanceof Object) {
            // try to guess the type
            if (!targetType && value.constructor !== Object /* && operationType === "classToPlain"*/)
                targetType = value.constructor;
            if (!targetType && source)
                targetType = source.constructor;
            // add transformed type to prevent circular references
            this.transformedTypes.push({ level: level, object: value });
            var keys = this.getKeys(targetType, value);
            var newValue = source ? source : {};
            if (!source && (this.transformationType === "plainToClass" || this.transformationType === "classToClass")) {
                if (isMap) {
                    newValue = new Map();
                }
                else if (targetType) {
                    newValue = new targetType();
                }
                else {
                    newValue = {};
                }
            }
            var _loop_1 = function (key) {
                var valueKey = key, newValueKey = key, propertyName = key;
                if (!this_1.options.ignoreDecorators && targetType) {
                    if (this_1.transformationType === "plainToClass") {
                        var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadataByCustomName(targetType, key);
                        if (exposeMetadata) {
                            propertyName = exposeMetadata.propertyName;
                            newValueKey = exposeMetadata.propertyName;
                        }
                    }
                    else if (this_1.transformationType === "classToPlain" || this_1.transformationType === "classToClass") {
                        var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(targetType, key);
                        if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name)
                            newValueKey = exposeMetadata.options.name;
                    }
                }
                // get a subvalue
                var subValue = undefined;
                if (value instanceof Map) {
                    subValue = value.get(valueKey);
                }
                else if (value[valueKey] instanceof Function) {
                    subValue = value[valueKey]();
                }
                else {
                    subValue = value[valueKey];
                }
                // determine a type
                var type = undefined, isSubValueMap = subValue instanceof Map;
                if (targetType && isMap) {
                    type = targetType;
                }
                else if (targetType) {
                    var metadata = storage_1.defaultMetadataStorage.findTypeMetadata(targetType, propertyName);
                    if (metadata) {
                        var options = { newObject: newValue, object: value, property: propertyName };
                        type = metadata.typeFunction(options);
                        isSubValueMap = isSubValueMap || metadata.reflectedType === Map;
                    }
                    else if (this_1.options.targetMaps) {
                        this_1.options.targetMaps
                            .filter(function (map) { return map.target === targetType && !!map.properties[propertyName]; })
                            .forEach(function (map) { return type = map.properties[propertyName]; });
                    }
                }
                // if value is an array try to get its custom array type
                var arrayType_1 = value[valueKey] instanceof Array ? this_1.getReflectedType(targetType, propertyName) : undefined;
                // const subValueKey = operationType === "plainToClass" && newKeyName ? newKeyName : key;
                var subSource = source ? source[valueKey] : undefined;
                // if its deserialization then type if required
                // if we uncomment this types like string[] will not work
                // if (this.transformationType === "plainToClass" && !type && subValue instanceof Object && !(subValue instanceof Date))
                //     throw new Error(`Cannot determine type for ${(targetType as any).name }.${propertyName}, did you forget to specify a @Type?`);
                // if newValue is a source object that has method that match newKeyName then skip it
                if (newValue.constructor.prototype) {
                    var descriptor = Object.getOwnPropertyDescriptor(newValue.constructor.prototype, newValueKey);
                    if ((this_1.transformationType === "plainToClass" || this_1.transformationType === "classToClass")
                        && (newValue[newValueKey] instanceof Function || (descriptor && !descriptor.set)))
                        return "continue";
                }
                if (!this_1.isCircular(subValue, level)) {
                    var transformKey = this_1.transformationType === "plainToClass" ? newValueKey : key;
                    var finalValue = this_1.transform(subSource, subValue, type, arrayType_1, isSubValueMap, level + 1);
                    finalValue = this_1.applyCustomTransformations(finalValue, targetType, transformKey);
                    if (newValue instanceof Map) {
                        newValue.set(newValueKey, finalValue);
                    }
                    else {
                        newValue[newValueKey] = finalValue;
                    }
                }
                else if (this_1.transformationType === "classToClass") {
                    var finalValue = subValue;
                    finalValue = this_1.applyCustomTransformations(finalValue, targetType, key);
                    if (newValue instanceof Map) {
                        newValue.set(newValueKey, finalValue);
                    }
                    else {
                        newValue[newValueKey] = finalValue;
                    }
                }
            };
            var this_1 = this;
            // traverse over keys
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                _loop_1(key);
            }
            return newValue;
        }
        else {
            return value;
        }
    };
    TransformOperationExecutor.prototype.applyCustomTransformations = function (value, target, key) {
        var _this = this;
        var metadatas = storage_1.defaultMetadataStorage.findTransformMetadatas(target, key, this.transformationType);
        // apply versioning options
        if (this.options.version !== undefined) {
            metadatas = metadatas.filter(function (metadata) {
                if (!metadata.options)
                    return true;
                return _this.checkVersion(metadata.options.since, metadata.options.until);
            });
        }
        // apply grouping options
        if (this.options.groups && this.options.groups.length) {
            metadatas = metadatas.filter(function (metadata) {
                if (!metadata.options)
                    return true;
                return _this.checkGroups(metadata.options.groups);
            });
        }
        else {
            metadatas = metadatas.filter(function (metadata) {
                return !metadata.options ||
                    !metadata.options.groups ||
                    !metadata.options.groups.length;
            });
        }
        metadatas.forEach(function (metadata) {
            value = metadata.transformFn(value);
        });
        return value;
    };
    // preventing circular references
    TransformOperationExecutor.prototype.isCircular = function (object, level) {
        return !!this.transformedTypes.find(function (transformed) { return transformed.object === object && transformed.level < level; });
    };
    TransformOperationExecutor.prototype.getReflectedType = function (target, propertyName) {
        if (!target)
            return undefined;
        var meta = storage_1.defaultMetadataStorage.findTypeMetadata(target, propertyName);
        return meta ? meta.reflectedType : undefined;
    };
    TransformOperationExecutor.prototype.getKeys = function (target, object) {
        var _this = this;
        // determine exclusion strategy
        var strategy = storage_1.defaultMetadataStorage.getStrategy(target);
        if (strategy === "none")
            strategy = this.options.strategy || "exposeAll"; // exposeAll is default strategy
        // get all keys that need to expose
        var keys = [];
        if (strategy === "exposeAll") {
            if (object instanceof Map) {
                keys = Array.from(object.keys());
            }
            else {
                keys = Object.keys(object);
            }
        }
        if (!this.options.ignoreDecorators && target) {
            // add all exposed to list of keys
            var exposedProperties = storage_1.defaultMetadataStorage.getExposedProperties(target, this.transformationType);
            if (this.transformationType === "plainToClass") {
                exposedProperties = exposedProperties.map(function (key) {
                    var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                    if (exposeMetadata && exposeMetadata.options && exposeMetadata.options.name) {
                        return exposeMetadata.options.name;
                    }
                    return key;
                });
            }
            keys = keys.concat(exposedProperties);
            // exclude excluded properties
            var excludedProperties_1 = storage_1.defaultMetadataStorage.getExcludedProperties(target, this.transformationType);
            if (excludedProperties_1.length > 0) {
                keys = keys.filter(function (key) {
                    return excludedProperties_1.indexOf(key) === -1;
                });
            }
            // apply versioning options
            if (this.options.version !== undefined) {
                keys = keys.filter(function (key) {
                    var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                    if (!exposeMetadata || !exposeMetadata.options)
                        return true;
                    return _this.checkVersion(exposeMetadata.options.since, exposeMetadata.options.until);
                });
            }
            // apply grouping options
            if (this.options.groups && this.options.groups.length) {
                keys = keys.filter(function (key) {
                    var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                    if (!exposeMetadata || !exposeMetadata.options)
                        return true;
                    return _this.checkGroups(exposeMetadata.options.groups);
                });
            }
            else {
                keys = keys.filter(function (key) {
                    var exposeMetadata = storage_1.defaultMetadataStorage.findExposeMetadata(target, key);
                    return !exposeMetadata ||
                        !exposeMetadata.options ||
                        !exposeMetadata.options.groups ||
                        !exposeMetadata.options.groups.length;
                });
            }
        }
        // exclude prefixed properties
        if (this.options.excludePrefixes && this.options.excludePrefixes.length) {
            keys = keys.filter(function (key) { return _this.options.excludePrefixes.every(function (prefix) {
                return key.substr(0, prefix.length) !== prefix;
            }); });
        }
        // make sure we have unique keys
        keys = keys.filter(function (key, index, self) {
            return self.indexOf(key) === index;
        });
        return keys;
    };
    TransformOperationExecutor.prototype.checkVersion = function (since, until) {
        var decision = true;
        if (decision && since)
            decision = this.options.version >= since;
        if (decision && until)
            decision = this.options.version < until;
        return decision;
    };
    TransformOperationExecutor.prototype.checkGroups = function (groups) {
        if (!groups)
            return true;
        return this.options.groups.some(function (optionGroup) { return groups.indexOf(optionGroup) !== -1; });
    };
    return TransformOperationExecutor;
}());
exports.TransformOperationExecutor = TransformOperationExecutor;

//# sourceMappingURL=TransformOperationExecutor.js.map
