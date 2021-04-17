/* global _ angular store moment */
'use strict';
angular.module('acs.services', []).
    factory('user', function ($q, $http) {
        return {
            clear: function () {
                store.set('user', {});
            },
            getSysId: function () {
                var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
                return user.sysId;
            },
            setSysId: function (sysId) {
                var user = _.isUndefined(store.get('user')) ? {} : store.get('user');
                user.sysId = sysId;
                store.set('user', user);
            }
        };
    }).factory('alerts', function ($interval) {
        var alerts = undefined;
        if (!window.alertsInterval) {
            window.alertsInterval = $interval(function () {
                var alive = [];
                _.forEach(alerts, function (alert) {
                    if (!moment().isAfter(moment(alert.timestamp).add(5, 'seconds'))) {
                        alive.push(alert);
                    }
                    ;
                });
                alerts = alive;
                store.set('alerts', alerts);
            }, 1000);
        }
        ;
        return {
            clear: function () {
                store.set('alerts', []);
            },
            get: function () {
                if (_.isUndefined(alerts)) {
                    alerts = store.get('alerts');
                }
                if (_.isEmpty(alerts)) {
                    alerts = [];
                }
                return alerts;
            },
            set: function (val) {
                alerts = val;
                store.set('alerts', alerts);
            },
            success: function (msg) {
                alerts.push({id: Math.random().toString(16), success: msg, timestamp: new Date().getTime()});
                store.set('alerts', alerts);
            },
            fail: function (msg) {
                alerts.push({id: Math.random().toString(16), danger: msg, timestamp: new Date().getTime()});
                store.set('alerts', alerts);
            }
        };
    }).factory('threeJS', function () {


        var isUserInteracting = false;
        var onMouseDownMouseX = 0, onMouseDownMouseY = 0, onMouseDownLon = 0,
                onMouseDownLat = 0, theta = 0, phi = 0;
        var lat = 0, old_lat = 0;
        var lon = 0, old_lon = 180;
        var globalObject;
        var camera, renderer;
        var container;
        var isMoving;
        var isReset = false;

        var onProgress;
        var onError;
        var texture;
        var chain_val = true;
        var font_obj;
        var group_obj = new THREE.Group();
        var scene = new THREE.Scene();
        var manager = new THREE.LoadingManager();
        var textureLoader = new THREE.TextureLoader(manager);
       // textureLoader.setCrossOrigin('anonymous');
        textureLoader.setCrossOrigin('Access-Control-Allow-Origin');
        var texture_bump, texture_alphaMap, valance_texture,
                texture_displacementMap, cornice_texture;
        var bottom_bar_type = 'BOTTOM_BAR1'//aluminium;
        var texture = textureLoader.load(image_path + 'texture12.png');
        var arrow_texture = textureLoader.load(image_path + 'arrow_texture.jpg');

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0, 0);
        //texture.repeat.set(2, 2);
        texture.alphaTest = 0.5;
        texture.anisotropy = 16;
        var loader = new THREE.OBJLoader(manager);
       // loader.setCrossOrigin('Access-Control-Allow-Origin')
        var border_texture, back_side_texture, bottom_bar_color, ladder_texture,
                cord_texture, trimming_texture, trimming_texture_alphaMap;
        var aluminium_texture = border_texture = back_side_texture = trimming_texture,
                trimming_texture_alphaMap = textureLoader.load(image_path + 'aluminium.jpg');
        var metal_texture = textureLoader.load(image_path + 'Metal.jpg');

        var plastic_texture = textureLoader.load(image_path + 'plastic.jpg');
        var plastic_texture_alphaMap = textureLoader.load(image_path + 'plastic_alphamap.jpg');
        var all_texture_url = null;
        var camera_fov = 75;
        var camera_near = 0.1;
        var camera_far = 75;
        var valance_hide = false;
        var cornice_hide = true;
        var roll_type = 'INSIDE_ROLL'
        var border_show = true;
        var bottom_border_show = false
        var side_border_show = false;
        var trimming_show = false;
        var two_way = true;
        var one_way = false;
        var glass_show = true;
        var border_color_array = new Object();

        // var wallpaper_material = new THREE.MeshBasicMaterial();
        var hor_outside_text_position, hor_inside_text_position;
        var vert_outside_text_position, vert_inside_text_position;
        var arrow_line = false;
        var valance_collection = ['1134247'];//CS Sheer
        var aluminum_color_collection = ['1140983'];
        //var bracket_left;
        var bracket_right = true;
        var louvo_valance = false;
        var arm_type = true;
        var controller;


        var font_loader = new THREE.FontLoader();
        var textMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, overdraw: true});

        font_loader.load(font_path + 'helvetiker_bold.typeface.json', function (font) {
            font_obj = font;
            var textGeo = new THREE.TextGeometry("0 CM", {
                font: font,
                size: 0.65,
                height: 2
            });


            var text_h_mesh = new THREE.Mesh(textGeo, textMaterial);
            text_h_mesh.rotation.set(-0.75, 1.6, 0.75);
            text_h_mesh.scale.set(0.5, 0.5, 0.01);
            text_h_mesh.name = "horizontal_text";

            var textGeo1 = new THREE.TextGeometry("0 CM", {
                font: font,
                size: 0.65,
                height: 2
            });

            var text_v_mesh = new THREE.Mesh(textGeo1, textMaterial);
            text_v_mesh.rotation.set(-1, 1.6, 2.55);
            text_v_mesh.scale.set(0.5, 0.5, 0.01);
            text_v_mesh.name = "vertical_text";
            group_obj['measuremen_text'] = group_obj.add(text_h_mesh, text_v_mesh);
            group_obj['measuremen_text'].name = 'measuremen_text';
            group_obj['measuremen_text'].visible = false;
            scene.add(group_obj['measuremen_text']);
        }, onProgress, onError);

        var serviceInstance = {
            init: function (data) {
                //remove the scene object
                scene.getObjectByName('background3dImage') ? scene.remove(scene.getObjectByName('background3dImage')) : '';
                scene.getObjectByName('wall_1') ? scene.remove(scene.getObjectByName('wall_1')) : '';
                scene.getObjectByName('wall_2') ? scene.remove(scene.getObjectByName('wall_2')) : '';
                valance_hide = false;
                cornice_hide = true;

                bottom_border_show = false
                side_border_show = false;
                roll_type = 'INSIDE_ROLL';
                controller = data.controller;
                border_color_array = new Object();

                if (data.object_info === undefined) {
                    //  console.log(data.object_info);
                    return false;
                }
                border_show = data.object_info.OBJ_BORDER_TYPE == 0 ? false : true;
                lat = old_lat = data.object_info.OBJ_LATITUDE ? parseInt(data.object_info.OBJ_LATITUDE) : 0;
                lon = old_lon = data.object_info.OBJ_LONGITUDE ? parseInt(data.object_info.OBJ_LONGITUDE) : 180;
                //  console.log(data.object_info);


                if (window.innerWidth < 480)
                {
                    isMoving = false;
                    var cmFov = 75;

                } else {
                    isMoving = data.isMoving;
                    var cmFov = parseInt(data.object_info.SCN_FOV_LENGTH);
                }

                // lon = parseInt(data.object_info.SCN_SCENE_LONGITUDE);
                camera_fov = cmFov; //parseInt(data.object_info.SCN_FOV_LENGTH);
                camera_near = data.object_info.SCN_CAMERA_NEAR_LENGTH;
                camera_far = data.object_info.SCN_CAMERA_FAR_LENGTH;

                container = document.getElementById(data.canvasId);
                camera = new THREE.PerspectiveCamera(camera_fov, data.canvasWidth / data.canvasHeight, camera_near, camera_far);
            // camera.position.set(10,50,10);
                camera.target = new THREE.Vector3(0, 0, 0);
                renderer = new THREE.WebGLRenderer({alpha: true, antialias: true, preserveDrawingBuffer: true});
                renderer.setClearColor(0xffffff, 0);
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(data.canvasWidth, data.canvasHeight);
                container.appendChild(renderer.domElement);

                manager.onProgress = function (item, loaded, total) {
                    //console.log(item, loaded, total);
                };
                // model
                onProgress = function (xhr) {

                    if (xhr.lengthComputable) {
                        $('.lds-ring').show();
                        var percentComplete = xhr.loaded / xhr.total * 100;
                        console.log(Math.round(percentComplete, 2) + '% downloaded');
                        if (Math.round(percentComplete, 2) == 100) {
                            $('.lds-ring').hide();
                        }
                    }
                };
                onError = function (xhr) {
                    console.log(xhr);
                };


                if (controller == 'sample')
                {
                    var background3dImage = textureLoader.load(image_path + 'visualizer-blank.png');
                    var materia = new THREE.MeshBasicMaterial({
                        map: background3dImage,
                        transparent: false,
                        //color: 'skyblue'
                    });
                    //z, y, x	
                    var mesh3d = new THREE.Mesh(new THREE.BoxGeometry(5, 84, 54.8), materia);
                    mesh3d.position.set(-55, 0, -0.2);
                    console.log(mesh3d);

                } else {
                    var background3dImage = textureLoader.load(image_upload + data.object_info.SCN_IMAGE_PATH);
                    var background_OCC_Img = data.object_info.SCN_OCC_IMAGE_PATH ? textureLoader.load(image_upload + data.object_info.SCN_OCC_IMAGE_PATH) : '';

                    var materia = new THREE.MeshBasicMaterial({
                        map: background3dImage,
                        alphaMap: background_OCC_Img,
                        transparent: background_OCC_Img ? true : false,
                        blending: THREE.NormalBlending,
                    });
                    var mesh3d = new THREE.Mesh(
                            new THREE.SphereBufferGeometry(480, 60, 40).scale(-1, 1, 1),
                            materia
                            );
                }




                background3dImage.anisotropy = 100;


                mesh3d.name = "background3dImage";
                scene.add(mesh3d);

                serviceInstance.animate();
                serviceInstance.TextFontLoad(data.object_info);
                //serviceInstance.onWindowResize();


                var isTouching = false;
                var mousePositionX;
                window.addEventListener("mousedown", function (e) {
                    isTouching = true;
                    mousePositionX = e.clientX
                });
                window.addEventListener("mouseup", function (e) {
                    isTouching = false
                });

                if (controller != 'sample')
                {
                    window.addEventListener('resize', serviceInstance.onWindowResize, false);
                }
            },
            TextFontLoad: function (data) {

                if (scene.getObjectByName('measurement_line')) {
                    scene.remove(scene.getObjectByName('measurement_line'));
                }

                hor_outside_text_position = data.OBJ_TEXT_OUTSIDE_HORIZONTAL ? splitString(data.OBJ_TEXT_OUTSIDE_HORIZONTAL) : [0, 0, 0];
                vert_outside_text_position = data.OBJ_TEXT_OUTSIDE_VERTICAL ? splitString(data.OBJ_TEXT_OUTSIDE_VERTICAL) : [0, 0, 0];

                hor_inside_text_position = data.OBJ_TEXT_INSIDE_HORIZONTAL ? splitString(data.OBJ_TEXT_INSIDE_HORIZONTAL) : [0, 0, 0];
                vert_inside_text_position = data.OBJ_TEXT_INSIDE_VERTICAL ? splitString(data.OBJ_TEXT_INSIDE_VERTICAL) : [0, 0, 0];

                scene.getObjectByName('horizontal_text') ? scene.getObjectByName('horizontal_text').position.set(hor_outside_text_position[0], hor_outside_text_position[1], hor_outside_text_position[2]) : '';
                scene.getObjectByName('vertical_text') ? scene.getObjectByName('vertical_text').position.set(vert_outside_text_position[0], vert_outside_text_position[1], vert_outside_text_position[2]) : '';
            },
            //text end
            measurementText: function (width, height) {
                if (isNaN(width) || isNaN(height)) {
                    //   scene.getObjectByName('measurement_line', true).visible = false;
                    scene.getObjectByName('measuremen_text', true).visible = false;
                    return false;
                } else {
                    //    scene.getObjectByName('measurement_line', true).visible = true;
                    scene.getObjectByName('measuremen_text', true).visible = true;

                }
                var color = new THREE.Color(0xff0000);
                var measuremen_text = scene.getObjectByName('measuremen_text');
                var textGeo = new THREE.TextGeometry(width + " CM", {
                    font: font_obj,
                    size: 0.65,
                    height: 2
                });
                textGeo.colors = color;
                measuremen_text.getObjectByName('horizontal_text').geometry = textGeo;


                var textGeo1 = new THREE.TextGeometry(height + " CM", {
                    font: font_obj,
                    size: 0.65,
                    height: 2
                });

                measuremen_text.getObjectByName('vertical_text').geometry = textGeo1;



                arrow_line = true;
                if(globalObject){
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Arrow_Aluminum_First_Hide") >= 0) {
                            child.visible = true;
                        }
                    }
                });
            }
                //console.log(measuremen_text.getObjectByName('vertical_text'));


            },
            animate: function () {
                // if (location.hash == "customizing" || location.hash == "material" || location.hash.search('material') > 0 || location.hash.search('customizing') > 0 || location.hash.search('editProduct') > 0) {
                requestAnimationFrame(serviceInstance.animate);
                serviceInstance.render();
                //}
            },
            render: function () {

                if (lon > 540 || lon < -180) {
                    lon = old_lon;
                }

                if (isMoving) {
                    lon += 0.05;
                    isReset = false;
                }
                if (isReset && lon != old_lon) {
                    if (lon > old_lon) {
                        lon -= 5;
                    } else {
                        lon += 5;
                    }
                    if (lon < eval(old_lon + 10) && lon > eval(old_lon - 10)) {
                        lon = old_lon;
                        isReset = false;
                    }

                }

                lat = Math.max(-85, Math.min(85, lat));
                phi = THREE.Math.degToRad(90 - lat);
                theta = THREE.Math.degToRad(lon);
                camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
                camera.target.y = 500 * Math.cos(phi);
                camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
                camera.lookAt(camera.target);
                //camera.lookAt( scene.position );
                renderer.render(scene, camera);
            },
            objectLoad: function ($obj_info, callback) {
                valance_texture = '';
                cornice_texture = '';
                if (scene) {
                    scene.getObjectByName('measurement_line') ? scene.getObjectByName('measurement_line', true).visible = false : '';
                    scene.getObjectByName('measuremen_text') ? scene.getObjectByName('measuremen_text', true).visible = false : '';
                }

                valance_hide = false;
                cornice_hide = true;
                roll_type = 'INSIDE_ROLL';

                isReset = false;
                chain_val = true;
                var material = '';
                arrow_line = false;

                $obj_info.forEach(function (e, i) {
                    border_show = e.OBJ_BORDER_TYPE == 0 ? false : true;
                    if (!serviceInstance.searchObj(e.OBJ_CODE) && e.OBJ_PATH) {
                        // loader.setCrossOrigin('anonymous')
                        if (controller == 'sample')
                        {
                            var OBJ_PATH = 'obj/roller_blind/Roller_Inside.obj';
                        } else {
                            var OBJ_PATH = e.OBJ_PATH;
                        }

                        loader.load(image_upload + OBJ_PATH, function (object) {
                            globalObject = object;
                            object.visible = true;
                            object.name = e.OBJ_DESC + e.OBJ_CODE;
                            object.obj_code = e.OBJ_CODE;
                            object.obj_type = e.OBJ_TYPE;
                            object.scene_type = 'OBJECT';
                            object.obj_data_info = e;

                            var p = splitString(e.OBJ_POSITION);
                            var s = splitString(e.OBJ_OUTSIDE_SCALE);
                            var r = splitString(e.OBJ_ROTATION);

                            if (controller == 'sample')
                            {
                                object.position.set(-51, 17, -0.2);
                                object.scale.set(0.035, 0.0265, 0.022);

                            } else {
                                object.position.set(p[0], p[1], p[2]);
                                object.scale.set(s[0], s[1], s[2]);

                            }
                            object.rotation.set(r[0], r[1], r[2]);

                            scene.add(object);

                            if (object.obj_data_info.light) {
                                serviceInstance.light(object.obj_data_info.light);
                            }

                            if ($obj_info.length == i + 1) {
                                setTimeout(function () {
                                    callback();
                                }, '10');
                            }

                            //scene.add(new_obj1, new_obj2);

                        }, onProgress, onError);

                    } else {
                        if ($obj_info.length == i + 1) {
                            setTimeout(function () {
                                callback();
                            }, '100');
                        }
                    }
                    aluminium_texture = e.OBJ_BOTTOM_TEXTURE_PATH ? textureLoader.load(image_upload + e.OBJ_BOTTOM_TEXTURE_PATH) : aluminium_texture;
                    aluminium_texture.wrapS = aluminium_texture.wrapT = THREE.RepeatWrapping;
                    aluminium_texture.repeat.set(10, 10);


                    metal_texture = e.OBJ_ACC_TEXTURE_PATH_1 ? textureLoader.load(image_upload + e.OBJ_ACC_TEXTURE_PATH_1) : metal_texture;
                    metal_texture.wrapS = metal_texture.wrapT = THREE.RepeatWrapping;
                    metal_texture.repeat.set(10, 10);



                    plastic_texture = e.OBJ_ACC_TEXTURE_PATH_2 ? textureLoader.load(image_upload + e.OBJ_ACC_TEXTURE_PATH_2) : aluminium_texture;
                    plastic_texture.wrapS = plastic_texture.wrapT = THREE.RepeatWrapping;
                    plastic_texture.repeat.set(1, 1);

                    plastic_texture_alphaMap = e.OBJ_ACC_TEXTURE_PATH_3 ? textureLoader.load(image_upload + e.OBJ_ACC_TEXTURE_PATH_3) : aluminium_texture;
                    plastic_texture_alphaMap.wrapS = plastic_texture_alphaMap.wrapT = THREE.RepeatWrapping;
                    plastic_texture_alphaMap.repeat.set(1, 1);

                    lat = old_lat = e.OBJ_LATITUDE ? parseInt(e.OBJ_LATITUDE) : 0;
                    lon = old_lon = e.OBJ_LONGITUDE ? parseInt(e.OBJ_LONGITUDE) : 180;


                });

                scene.children.forEach(function (obj) {

                    if (obj.hasOwnProperty('scene_type') && obj.scene_type == 'OBJECT') {
                        var is_not_obj = true;
                        $obj_info.forEach(function (b) {
                            if (b.OBJ_CODE == obj.obj_code) {
                                is_not_obj = false;
                            }
                        });
                        if (is_not_obj) {
                            scene.remove(obj);
                        }

                    }
                });

            },
            designType: function ($obj_info, callback) {

                loader.load(image_upload + $obj_info.OBJ_PATH, function (object) {
                    globalObject = object;
                    object.visible = true;
                    object.name = $obj_info.OBJ_DESC + $obj_info.OBJ_CODE;
                    object.obj_code = $obj_info.OBJ_CODE;
                    object.obj_type = $obj_info.OBJ_TYPE;
                    object.scene_type = 'OBJECT';
                    object.obj_data_info = $obj_info;

                    var p = splitString($obj_info.OBJ_POSITION);
                    var s = splitString($obj_info.OBJ_OUTSIDE_SCALE);
                    var r = splitString($obj_info.OBJ_ROTATION);
                    object.position.set(p[0], p[1], p[2]);
                    object.scale.set(s[0], s[1], s[2]);
                    object.rotation.set(r[0], r[1], r[2]);

                    scene.add(object);

                    setTimeout(function () {
                        callback(all_texture_url);
                    }, '100');
                }, onProgress, onError);



                scene.children.forEach(function (obj) {

                    if (obj.hasOwnProperty('scene_type') && obj.scene_type == 'OBJECT') {

                        if ($obj_info.OBJ_CODE != obj.obj_code) {
                            scene.remove(obj);
                        }

                    }
                });

            },
            light: function (light_obj, light_val) {
                //console.log(globalObject);
                // console.log(light_obj);
                if (light_obj.length == 0) {
                    return false;
                }
                scene.children.forEach(function (e) {
                    if (e.name == 'Light') {
                        scene.remove(e);
                    }
                });

                var light_group = new THREE.Group();
                angular.forEach(light_obj, function (e, j) {
                    var p = e.OBL_POSITION.split(',');
                    var s = e.OBL_SCALE.split(',');

                    //var pointLight = new THREE.DirectionalLight('0xcccccc', 0.7);
                    // var pointLight = new THREE.DirectionalLight('0xcccccc', 0.7);

                    var color = new THREE.Color(eval(e.OBL_COLOR));
                    var pointLight;
                    switch (e.OBL_LIGHT_TYPE) {
                        case '1':
                            pointLight = new THREE.PointLight(color, e.OBL_VALUE);
                            //  var pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
                            //scene.add(pointLightHelper);
                            break;
                        case '2':
                            pointLight = new THREE.DirectionalLight(color, e.OBL_VALUE);
                            break;
                        case '3':
                            pointLight = new THREE.HemisphereLight(color, e.OBL_VALUE);
                            break
                        case '4':
                            pointLight = new THREE.AmbientLight(color, e.OBL_VALUE);

                            break
                        case '5':
                            pointLight = new THREE.SpotLight(color, e.OBL_VALUE);
                            break;
                        default:
                            pointLight = new THREE.DirectionalLight('0xffffff', '0.2');
                            // var spotLightHelper = new THREE.DirectionalLightHelper(pointLight, 1);
                            // scene.add(spotLightHelper);

                            break;

                    }
                    pointLight.position.set(p[0], p[1], p[2]);
                    pointLight.rotation.set(s[0], s[1], s[2]);
                    pointLight.scale.set(s[0], s[1], s[2]);

                    light_group.add(pointLight);

                });
                if (light_val) {
                    var amb_light = new THREE.AmbientLight(0xffffff, light_val);
                    light_group.add(amb_light);
                }
                light_group.name = 'Light';
                scene.add(light_group);
            },
            onDocumentMouseDown: function (event) {
                event.preventDefault();
                isUserInteracting = true;
                onMouseDownMouseX = event.clientX;
                onMouseDownMouseY = event.clientY;
                onMouseDownLon = lon;
                onMouseDownLat = lat;
            },
            onDocumentMouseMove: function (event) {
                if (isUserInteracting === true) {
                    lon = (onMouseDownMouseX - event.clientX) * 0.1 + onMouseDownLon;
                    lat = (event.clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
                }

            },
            touchDown: function (event) {
                event.preventDefault();
                isUserInteracting = true;
                onMouseDownMouseX = event.touches[0].clientX;
                onMouseDownMouseY = event.touches[0].clientY;
                onMouseDownLon = lon;
                onMouseDownLat = lat;
            },
            touchMove: function (event) {
                if (isUserInteracting === true) {
                    lon = (onMouseDownMouseX - event.touches[0].clientX) * 0.1 + onMouseDownLon;
                    lat = (event.touches[0].clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
                }

            },
            onDocumentMouseUp: function (event) {
                isUserInteracting = false;
            },
            onDocumentMouseWheel: function (event) {
                var fov = camera.fov + event.deltaY * 0.25;
                camera.fov = THREE.Math.clamp(fov, 10, camera_fov + 20);
                camera.updateProjectionMatrix();
                return fov;
            },
            movingPlay: function (type) {
                if (type == 'stop') {
                    isMoving = false;
                }
                else if (isMoving === true) {
                    isMoving = false;
                    //  $('#play').text('Play ').removeClass('btn-danger').addClass('btn-success');
                } else {
                    isMoving = true;
                    // $('#play').text('Pause').addClass('btn-danger').removeClass('btn-success');
                }

            },
            rotateTextureImg: function (val) {
                texture.rotation = val;
                texture_bump.rotation = val;
                texture_alphaMap.rotation = val;
                texture_displacementMap.rotation = val;
            },
            updateTextureImg: function (material_info) {
                //  console.log(roll_type);
                //   console.log(globalObject);
                // console.log(material_info);
                back_side_texture = '';
                if (!material_info) {
                    console.log(material_info);
                    return false;
                }
                // console.log(valance_texture);
                all_texture_url = material_info;
                var effect_info = material_info && material_info.ECM_EFFECT_TYPE ? splitString(material_info.ECM_EFFECT_TYPE) : [];

                if (controller == 'sample')
                {
                    var repeat = splitString('4,4');
                } else {
                    var repeat = material_info.ECM_REPEAT_TEXTURE ? splitString(material_info.ECM_REPEAT_TEXTURE) : splitString('4,4');
                }
                var repeat_h = repeat[0];
                var repeat_v = repeat.length > 1 ? repeat[1] : repeat[0];

                // THREE.ImageUtils.crossOrigin = '';
                texture = material_info.ECM_IMAGE_PATH ? textureLoader.load(image_upload + material_info.ECM_IMAGE_PATH) : texture;
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(repeat_h, repeat_v);

                //double_side_texture = material_info.ECM_BACK_SIDE_TEXTURE_IMG_PATH ? textureLoader.load(image_upload + material_info.ECM_BACK_SIDE_TEXTURE_IMG_PATH) : texture;

                back_side_texture = material_info.ECM_BACK_SIDE_TEXTURE_IMG_PATH ? textureLoader.load(image_upload + material_info.ECM_BACK_SIDE_TEXTURE_IMG_PATH) : texture;
                back_side_texture.wrapS = back_side_texture.wrapT = THREE.RepeatWrapping;
                back_side_texture.repeat.set(repeat_h, repeat_v);

                if (material_info.ECM_MATCH_REPEAT_TEXTURE_1 && material_info.ECM_MATCH_TEXTURE_PATH_1) {
                    var cord_repeat = material_info.ECM_MATCH_REPEAT_TEXTURE_1 ? splitString(material_info.ECM_MATCH_REPEAT_TEXTURE_1) : splitString('4,4');
                    cord_texture = material_info.ECM_MATCH_TEXTURE_PATH_1 ? textureLoader.load(image_upload + material_info.ECM_MATCH_TEXTURE_PATH_1) : texture;
                    cord_texture.wrapS = cord_texture.wrapT = THREE.RepeatWrapping;
                    cord_texture.repeat.set(cord_repeat[0], cord_repeat[1]);
                }
                if (material_info.ECM_MATCH_REPEAT_TEXTURE_2 && material_info.ECM_MATCH_TEXTURE_PATH_2) {
                    var ladder_repeat = material_info.ECM_MATCH_REPEAT_TEXTURE_2 ? splitString(material_info.ECM_MATCH_REPEAT_TEXTURE_2) : splitString('4,4');
                    ladder_texture = material_info.ECM_MATCH_TEXTURE_PATH_2 ? textureLoader.load(image_upload + material_info.ECM_MATCH_TEXTURE_PATH_2) : texture;
                    ladder_texture.wrapS = ladder_texture.wrapT = THREE.RepeatWrapping;
                    ladder_texture.repeat.set(ladder_repeat[0], ladder_repeat[1]);
                }

                //texture.anisotropy = 16;
                //var panel_type = $('#panel_type').val() ? $('#panel_type').val() : null;
                var panel_type = null;
                //100=>Blackout,101=>CS Sheer,102=>Sun Screen,103=>Wall Covering
                effect_info.forEach(function (effect) {
                    if (material_info.ECM_NORMAL_IMG_PATH) {
                        texture_bump = material_info.ECM_NORMAL_IMG_PATH ? textureLoader.load(image_upload + material_info.ECM_NORMAL_IMG_PATH) : texture_bump;
                        texture_bump.wrapS = texture_bump.wrapT = THREE.RepeatWrapping;
                        texture_bump.repeat.set(repeat_h, repeat_v);
                    }
                    if (material_info.ECM_SPECULAR_IMG_PATH) {
                        texture_alphaMap = material_info.ECM_IMAGE_PATH ? textureLoader.load(image_upload + material_info.ECM_SPECULAR_IMG_PATH) : texture_alphaMap;
                        texture_alphaMap.wrapS = texture_alphaMap.wrapT = THREE.RepeatWrapping;
                        texture_alphaMap.repeat.set(repeat_h, repeat_v);
                    }
                    if (material_info.ECM_DISPLACEMENT_IMG_PATH) {
                        texture_displacementMap = material_info.ECM_DISPLACEMENT_IMG_PATH ? textureLoader.load(image_upload + material_info.ECM_DISPLACEMENT_IMG_PATH) : texture_displacementMap;
                        texture_displacementMap.wrapS = texture_displacementMap.wrapT = THREE.RepeatWrapping;
                        texture_displacementMap.repeat.set(repeat_h, repeat_v);
                    }
                });
                if (globalObject === undefined) {
                    console.log(globalObject);
                    return false;
                }

                globalObject.traverse(function (child) {

                    if (child instanceof THREE.Mesh) {
                        //  debugger;
                        //child.material.map = child.name.search(panel_type) >= 0 ? aluminium_texture : texture;
                        //   console.log(child.name);
                        if (panel_type) {
                            if (child.name.search(panel_type) >= 0) {
                                child.material.map = texture;
                            }
                        } else if (child.name.search("Valance_Color") >= 0) {
                            if (valance_collection.indexOf(material_info.ECM_ECC_CODE) >= 0 && !louvo_valance) {
                                //child.material.map = back_side_texture;
                                child.material.map = aluminium_texture;
                            } else {
                                if (child.name.search("Valance_Color_Aluminum") >= 0) {
                                    child.material.map = valance_texture ? valance_texture : aluminium_texture;
                                } else {
                                    child.material.map = valance_texture ? valance_texture : texture;
                                }
                            }
                        } else if (child.name.search("Cornice_Color") >= 0 && cornice_texture) {
                            //console.log(cornice_texture);
                            child.material.map = cornice_texture ? cornice_texture : aluminium_texture;
                        } else if (child.name.search("Bottom_Border") >= 0 && bottom_border_show) {
                            child.material.map = border_texture;
                        } else if (child.name.search("Side_Border") >= 0 && side_border_show) {
                            child.material.map = border_texture;
                        } else if (child.name.search("Trimming_Aluminum") >= 0 && trimming_show) {
                            child.material.map = trimming_texture;
                        } else if (child.name.search("Frame") >= 0 && border_show && Object.keys(border_color_array).length == 0) {//ch
                            child.material.map = border_texture;
                        } else if (Object.keys(border_color_array).length > 1 && child.hasOwnProperty('border_type') && child.border_type && serviceInstance.borderCheck(child.name)) {
                            child.material.map = border_texture;
                        } else if (child.name.search("Bottom_Rail_Aluminum") >= 0) {

                            if (bottom_bar_type == 'BOTTOM_BAR1') {
                                child.material.map = aluminium_texture;
                                if (valance_collection.indexOf(material_info.ECM_ECC_CODE) >= 0) {
                                    bottom_bar_color = back_side_texture;
                                } else {
                                    bottom_bar_color = texture;
                                }
                            }
                            if (bottom_bar_type == 'BOTTOM_BAR') {
                                if (valance_collection.indexOf(material_info.ECM_ECC_CODE) >= 0) {
                                    bottom_bar_color = back_side_texture;
                                    child.material.map = back_side_texture;
                                } else {
                                    child.material.map = texture;
                                    bottom_bar_color = texture;
                                }
                            }
                        } else if (aluminum_color_collection.indexOf(material_info.ECM_ECC_CODE) >= 0 && child.name.search("WhiteDesign") >= 0) {
                            child.material.map = aluminium_texture;
                        } else if (child.name.search("Arrow_Aluminum") >= 0) {
                            child.material.map = arrow_texture;
                        } else if (child.name.search("Metal") >= 0) {
                            child.material.map = metal_texture;
                        } else if (child.name.search("Cord_Color") >= 0) {
                            child.material.map = cord_texture ? cord_texture : texture;
                        } else if (child.name.search("Ladder_Color") >= 0) {
                            child.material.map = ladder_texture ? ladder_texture : texture;
                        } else if (child.name.search("Plastic_Color") >= 0) {
                            child.material.map = plastic_texture ? plastic_texture : texture;
                        }
                        else {
                            child.material.map = child.name.search("Aluminum") >= 0 ? aluminium_texture : texture;
                        }

                        child.material.side = THREE.DoubleSide;
                        child.material.bumpMap = null;
                        child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 1;
                        child.material.alphaMap = null;
                        child.material.displacementMap = null;
                        child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 1;
                        child.material.displacementBias = 0;
                        child.material.normalMap = null;
                        child.material.specularMap = null;
                        child.material.blendDst = null;
                        child.material.transparent = null;
                        child.material.needsUpdate = true;


                        //Normal Map Start
                        child.material.shininess = material_info.ECM_SHININESS > 0 ? material_info.ECM_SHININESS : 5;

                        if (child.name.search("Valance") >= 0 && !valance_hide) {
                            child.visible = true;
                        } else if (child.name.search("Trimming_Aluminum_Fabric_Two_Way") >= 0 && trimming_show) {
                            child.visible = two_way;
                        } else if (child.name.search("Trimming_Aluminum") >= 0 && child.name.search("First_Hide") >= 0) {
                            child.visible = trimming_show;
                        } else if (child.name.search("Cornice") >= 0 && !cornice_hide) {
                            child.visible = true;
                        } else if (child.name.search("Border_Aluminum") >= 0) {
                            if (child.name.search("Manual") >= 0 && border_show) {
                                child.visible = chain_val;
                            } else if (child.name.search("Motorized") >= 0 && border_show) {
                                child.visible = !chain_val;
                            } else {
                                child.visible = border_show ? true : false;
                            }

                        } else if (child.name.search("Inside") >= 0) {
                            //child.visible = true;
                            child.visible = roll_type == 'INSIDE_ROLL' ? true : false;
                        } else if (child.name.search("Outside") >= 0) {
                            //child.visible = true;
                            child.visible = roll_type == 'OUTSIDE_ROLL' ? true : false;
                        } else if (child.name.search("One_Way") >= 0) {
                            if (child.name.search("Bracket_Right") >= 0 && one_way) {
                                if (child.name.search("GMP") >= 0 && bracket_right) {
                                    child.visible = glass_show;
                                } else if (child.name.search("WMP") >= 0 && bracket_right) {
                                    child.visible = !glass_show;
                                } else {
                                    child.visible = !chain_val ? chain_val : bracket_right;
                                }
                            } else if (child.name.search("Bracket_Left") >= 0 && one_way) {
                                if (child.name.search("GMP") >= 0 && !bracket_right) {
                                    child.visible = glass_show;
                                } else if (child.name.search("WMP") >= 0 && !bracket_right) {
                                    child.visible = !glass_show;
                                } else {
                                    child.visible = !chain_val ? chain_val : !bracket_right;
                                }
                            } else {
                                child.visible = one_way ? one_way : false;
                            }
                        } else if (child.name.search("Two_Way") >= 0) {
                            if (child.name.search("GMP") >= 0 && two_way) {
                                child.visible = glass_show;
                            } else if (child.name.search("WMP") >= 0 && two_way) {
                                child.visible = !glass_show;
                            } else {
                                child.visible = two_way ? two_way : false;
                            }
                        } else if (child.name.search("DenHaag_Rail_Aluminum") >= 0) {
                            child.visible = false;
                        } else if (child.name.search("CCC") >= 0 && one_way) {
                            child.visible = one_way;
                        } else if (child.name.search("AAA") >= 0) {
                            child.visible = true;
                        } else if (child.name.search("BBB") >= 0) {
                            child.visible = true;
                        } else if (child.name.search("Arrow_Aluminum_First_Hide") >= 0) {
                            child.visible = arrow_line;
                        } else if (child.name.search("Bracket_Right") >= 0) {
                            child.visible = !chain_val ? chain_val : bracket_right;
                        } else if (child.name.search("Bracket_Left") >= 0) {
                            child.visible = !chain_val ? chain_val : !bracket_right;
                        } else if (child.name.search("Manual") >= 0) {
                            child.visible = chain_val;
                        } else if (child.name.search("Motorized") >= 0) {
                            child.visible = !chain_val;
                        } else if (child.name.search("3Arms") >= 0) {
                            child.visible = arm_type ? true : false;
                        } else if (child.name.search("4Arms") >= 0) {
                            child.visible = arm_type ? false : true;
                        } else if (child.name.search("First_Hide") >= 0) {
                            child.visible = true;
                        }

                        if (child.name.search("Fabric") > 0) {
                            effect_info.forEach(function (effect) {
                                if (child.name.search("Aluminum") < 0 && ['101', '102'].indexOf(effect) >= 0 && material_info.ECM_NORMAL_IMG_PATH) {
                                    //  child.material.blending = THREE['CustomBlending'];
                                    //  child.material.blendSrc = THREE['SrcAlphaFactor'];
                                    // child.material.blendDst = THREE['SrcColorFactor' ];

                                    child.material.bumpMap = texture_bump;
                                    child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0.3;
                                    child.material.alphaMap = texture_alphaMap;
                                    child.material.displacementMap = texture_displacementMap;
                                    child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0.5;
                                    child.material.displacementBias = 1;
                                    child.material.transparent = true;

                                    // child.material.specularMap=texture_alphaMap;
                                } else if (child.name.search("Aluminum") < 0 && effect == 100 && material_info.ECM_NORMAL_IMG_PATH && material_info.ECM_SPECULAR_IMG_PATH) {
                                    //   child.material.specular = 0x333333;
                                    child.material.shininess = material_info.ECM_SHININESS > 0 ? material_info.ECM_SHININESS : 15;
                                    child.material.normalMap = texture_bump;
                                    child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0.3;
                                    child.material.specularMap = texture_alphaMap;
                                    child.material.displacementMap = texture_displacementMap;
                                    child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0.5;
                                    child.material.displacementBias = 1;
                                    child.material.normalScale = new THREE.Vector2(0.85, 0.85);
                                } else if (child.name.search("Aluminum") < 0 && effect == 103 && material_info.ECM_NORMAL_IMG_PATH && material_info.ECM_SPECULAR_IMG_PATH) {
                                    //   child.material.specular = 0x333333;
                                    child.material.shininess = material_info.ECM_SHININESS > 0 ? material_info.ECM_SHININESS : 15;
                                    child.material.normalMap = texture_bump;
                                    child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0.02;
                                    child.material.specularMap = texture_alphaMap;
                                    child.material.displacementMap = texture_displacementMap;
                                    child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0.5;
                                    child.material.displacementBias = 1;
                                    child.material.normalScale = new THREE.Vector2(0.85, 0.85);
                                }
                                else if (child.name.search("Aluminum") < 0 && effect == 104 && material_info.ECM_SPECULAR_IMG_PATH) {
                                    child.material.alphaMap = texture_alphaMap;
                                    child.material.transparent = true;
                                } else {
                                    child.material.transparent = false;
                                }
                            });

                            if (child.name.search("Bottom_Border") >= 0 && bottom_border_show) {
                                child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0;
                                child.material.alphaMap = null;
                                child.material.blending = null;
                                child.material.transparent = false;
                                child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0;
                                child.material.map = border_texture;
                            } else if (child.name.search("Side_Border") >= 0 && side_border_show) {
                                child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0;
                                child.material.alphaMap = null;
                                child.material.blending = null;
                                child.material.transparent = false;
                                child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0;
                                child.material.map = border_texture;
                            } 
                        }
                        if (child.name.search("Back_Color") > 0 && material_info.ECM_BACK_SIDE_TEXTURE_IMG_PATH) {

                            child.material.bumpMap = null;
                            child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0;
                            child.material.alphaMap = null;
                            child.material.blending = null;
                            //child.material.blendSrc = null;
                            //child.material.blendDst = null;
                            child.material.transparent = false;
                            child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0;
                            child.material.map = back_side_texture;

                        } else if (child.name.search("Plastic_Color") >= 0 && plastic_texture_alphaMap) {
                            child.material.alphaMap = plastic_texture_alphaMap;
                            child.material.transparent = true;
                        } else if (child.name.search("Trimming_Aluminum") >= 0 && trimming_texture_alphaMap) {
                            child.material.alphaMap = trimming_texture_alphaMap;
                            child.material.transparent = true;
                        }
                    }

                });
                //   console.log(texture);
            },
            borderCheck: function (child_name) {
                var border_t = false;
                for (var val in border_color_array) {
                    if (val > 0) {
                        var border_name = border_color_array[val].b_name;
                        var reg_exp = new RegExp(border_name, 'g');
                        var border_type = border_color_array[val].b_type;
                        var h_border = child_name.match(reg_exp);

                        if (h_border != null && (child_name.search(border_name) > 5 || h_border.length == 2) && border_type == 'BOR04') {
                            border_texture = border_color_array[val];
                            border_t = true;
                            break;
                        } else if (h_border != null && child_name.search(border_name) == 0 && border_type == 'BOR05') {
                            border_texture = border_color_array[val];
                            border_t = true;
                            break;
                        }
                    }
                }
                return border_t;
            },
            updateBorderTextureImg: function (material_info, border_no, border_type) {
                var border_name = border_no ? 'Curtain' + border_no : 'Curtain';
                if (globalObject === undefined) {
                    console.log(globalObject);
                    return false;
                }
                console.log(globalObject);

                //  var repeat = material_info.ECM_REPEAT_TEXTURE ? material_info.ECM_REPEAT_TEXTURE : 4;

                var repeat = material_info.ECM_REPEAT_TEXTURE ? splitString(material_info.ECM_REPEAT_TEXTURE) : splitString('4,4');
                var repeat_h = repeat[0];
                var repeat_v = repeat.length > 1 ? repeat[1] : repeat[0];
                border_texture = material_info.ECM_IMAGE_PATH ? textureLoader.load(image_upload + material_info.ECM_IMAGE_PATH) : texture;
                border_texture.wrapS = border_texture.wrapT = THREE.RepeatWrapping;
                border_texture.repeat.set(repeat_h, repeat_v);
                border_texture.b_name = border_name;
                border_texture.b_type = border_type;
                // console.log(globalObject);
                var reg_exp = new RegExp(border_name, 'g');
                if (border_no) {
                    border_color_array[border_no] = border_texture;
                }
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {

                        child.material.side = THREE.DoubleSide;
                        child.material.bumpMap = null;
                        child.material.displacementMap = null;
                        child.material.displacementBias = 0;
                        child.material.normalMap = null;
                        child.material.specularMap = null;
                        child.material.blendDst = null;
                        child.material.needsUpdate = true;


    /*                    
                            child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0;
                            child.material.alphaMap = null;
                            child.material.blending = null;
                            //child.material.blendSrc = null;
                            //child.material.blendDst = null;
                            child.material.transparent = false;
                            child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0;
    */


                        var h_border = child.name.match(reg_exp);
                        if (child.name.search("Border_Aluminum") >= 0) {
                            aluminium_texture = border_texture;
                            child.material.map = aluminium_texture;
                        } else if (child.name.search("Frame") >= 0) {
                            //  child.visible = true;
                            child.material.map = border_texture;
                        } else if (child.name.search("Bottom_Border") >= 0 && bottom_border_show) {
                            
                            child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0;
                            child.material.alphaMap = null;
                            child.material.blending = null;
                            child.material.transparent = false;
                            child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0;
                            child.material.map = border_texture;
                        } else if (child.name.search("Side_Border") >= 0 && side_border_show) {
                            child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0;
                            child.material.alphaMap = null;
                            child.material.blending = null;
                            //child.material.blendSrc = null;
                            //child.material.blendDst = null;
                            child.material.transparent = false;
                            child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0;
                            
                            child.material.map = border_texture;
                        } else if (h_border && (child.name.search(border_name) > 5 || h_border.length == 2) && border_type == 'BOR04') {//H
                            child.material.map = border_texture;
                            child.border_type = 'Horizontal';
                        } else if (child.name.search(border_name) == 0 && border_type == 'BOR05') {//V
                            child.material.map = border_texture;
                            child.border_type = 'Vertical';
                        }
                        //Normal Map Start
                        //child.material.shininess = material_info.ECM_SHININESS > 0 ? material_info.ECM_SHININESS : 5;
                    }
                });

            },
            boderRemove: function (border_no) {
                delete border_color_array[border_no];
                serviceInstance.updateTextureImg(all_texture_url);
            },
            valanceColor: function (material_info) {
                if (globalObject === undefined) {
                    console.log(globalObject);
                    return false;
                }
                // var repeat = material_info.ECM_REPEAT_TEXTURE ? material_info.ECM_REPEAT_TEXTURE : 4;
                var repeat = material_info.ECM_REPEAT_TEXTURE ? splitString(material_info.ECM_REPEAT_TEXTURE) : splitString('4,4');
                var repeat_h = repeat[0];
                var repeat_v = repeat.length > 1 ? repeat[1] : repeat[0];
                // THREE.ImageUtils.crossOrigin = '';
                valance_texture = material_info.ECM_IMAGE_PATH ? textureLoader.load(image_upload + material_info.ECM_IMAGE_PATH) : texture;
                valance_texture.wrapS = valance_texture.wrapT = THREE.RepeatWrapping;
                valance_texture.repeat.set(repeat_h, repeat_v);
                //  console.log(globalObject);

                globalObject.traverse(function (child) {

                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Valance_Color") >= 0) {
                            child.material.map = valance_texture;
                        }
                    }
                });

            },
            glassColor: function (material_info) {
                // console.log(material_info);
                if (globalObject === undefined) {
                    console.log(globalObject);
                    return false;
                }
                var repeat = material_info.ECM_REPEAT_TEXTURE ? splitString(material_info.ECM_REPEAT_TEXTURE) : splitString('4,4');
                var repeat_h = repeat[0];
                var repeat_v = repeat.length > 1 ? repeat[1] : repeat[0];
                // THREE.ImageUtils.crossOrigin = '';
                plastic_texture = material_info.ECM_IMAGE_PATH ? textureLoader.load(image_upload + material_info.ECM_IMAGE_PATH) : texture;
                plastic_texture.wrapS = plastic_texture.wrapT = THREE.RepeatWrapping;
                plastic_texture.repeat.set(repeat_h, repeat_v);

                if (material_info.ECM_SPECULAR_IMG_PATH) {
                    plastic_texture_alphaMap = material_info.ECM_IMAGE_PATH ? textureLoader.load(image_upload + material_info.ECM_SPECULAR_IMG_PATH) : texture_alphaMap;
                    plastic_texture_alphaMap.wrapS = plastic_texture_alphaMap.wrapT = THREE.RepeatWrapping;
                    plastic_texture_alphaMap.repeat.set(repeat_h, repeat_v);
                }

                globalObject.traverse(function (child) {

                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Plastic_Color") >= 0) {
                            child.material.map = plastic_texture;
                            child.material.alphaMap = plastic_texture_alphaMap;
                            child.material.transparent = true;
                        }

                    }
                });

            },
            corniceColor: function (material_info) {
                if (globalObject === undefined) {
                    console.log(globalObject);
                    return false;
                }

                //console.log(globalObject);
                var repeat = material_info.ECM_REPEAT_TEXTURE ? splitString(material_info.ECM_REPEAT_TEXTURE) : splitString('4,4');
                var repeat_h = repeat[0];
                var repeat_v = repeat.length > 1 ? repeat[1] : repeat[0];
                cornice_texture = material_info.ECM_IMAGE_PATH ? textureLoader.load(image_upload + material_info.ECM_IMAGE_PATH) : texture;
                cornice_texture.wrapS = cornice_texture.wrapT = THREE.RepeatWrapping;
                cornice_texture.repeat.set(repeat_h, repeat_v);


                if (material_info.ECM_NORMAL_IMG_PATH && material_info.ECM_SPECULAR_IMG_PATH) {
                    texture_bump = material_info.ECM_NORMAL_IMG_PATH ? textureLoader.load(image_upload + material_info.ECM_NORMAL_IMG_PATH) : texture_bump;
                    texture_bump.wrapS = texture_bump.wrapT = THREE.RepeatWrapping;
                    texture_bump.repeat.set(repeat_h, repeat_v);

                    texture_alphaMap = material_info.ECM_IMAGE_PATH ? textureLoader.load(image_upload + material_info.ECM_SPECULAR_IMG_PATH) : texture_alphaMap;
                    texture_alphaMap.wrapS = texture_alphaMap.wrapT = THREE.RepeatWrapping;
                    texture_alphaMap.repeat.set(repeat_h, repeat_v);

                    texture_displacementMap = material_info.ECM_DISPLACEMENT_IMG_PATH ? textureLoader.load(image_upload + material_info.ECM_DISPLACEMENT_IMG_PATH) : texture_displacementMap;
                    texture_displacementMap.wrapS = texture_displacementMap.wrapT = THREE.RepeatWrapping;
                    texture_displacementMap.repeat.set(repeat_h, repeat_v);
                }
                globalObject.traverse(function (child) {

                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Cornice_Color") >= 0) {
                            child.material.shininess = material_info.ECM_SHININESS > 0 ? material_info.ECM_SHININESS : 15;
                            child.material.map = cornice_texture;
                            child.material.normalMap = texture_bump;
                            child.material.bumpScale = material_info.ECM_BUMPSCALE > 0 ? material_info.ECM_BUMPSCALE : 0.3;
                            child.material.specularMap = texture_alphaMap;
                            child.material.displacementMap = texture_displacementMap;
                            child.material.displacementScale = material_info.ECM_DISPLACEMENTSCALE > 0 ? material_info.ECM_DISPLACEMENTSCALE : 0.5;
                            child.material.displacementBias = 1;
                            child.material.normalScale = new THREE.Vector2(0.85, 0.85);
                        }
                    }
                });

            },
            trimmingColor: function (material_info) {
                //console.log(material_info);
                if (globalObject === undefined) {
                    console.log(globalObject);
                    return false;
                }
                var repeat = material_info.ECM_REPEAT_TEXTURE ? splitString(material_info.ECM_REPEAT_TEXTURE) : splitString('4,4');
                var repeat_h = repeat[0];
                var repeat_v = repeat.length > 1 ? repeat[1] : repeat[0];
                // THREE.ImageUtils.crossOrigin = '';
                trimming_texture = material_info.ECM_IMAGE_PATH ? textureLoader.load(image_upload + material_info.ECM_IMAGE_PATH) : texture;
                trimming_texture.wrapS = trimming_texture.wrapT = THREE.RepeatWrapping;
                trimming_texture.repeat.set(repeat_h, repeat_v);

                if (material_info.ECM_SPECULAR_IMG_PATH) {
                    trimming_texture_alphaMap = material_info.ECM_SPECULAR_IMG_PATH ? textureLoader.load(image_upload + material_info.ECM_SPECULAR_IMG_PATH) : texture_alphaMap;
                    trimming_texture_alphaMap.wrapS = trimming_texture_alphaMap.wrapT = THREE.RepeatWrapping;
                    trimming_texture_alphaMap.repeat.set(repeat_h, repeat_v);
                }

                globalObject.traverse(function (child) {

                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Trimming_Aluminum") >= 0) {

                            child.material.side = THREE.DoubleSide;
                            child.material.bumpMap = null;
                            child.material.displacementMap = null;
                            child.material.displacementBias = 0;
                            child.material.normalMap = null;
                            child.material.specularMap = null;
                            child.material.blendDst = null;
                            child.material.needsUpdate = true;

                            child.material.map = trimming_texture;
                            child.material.alphaMap = trimming_texture_alphaMap;
                            child.material.transparent = true;
                        }

                    }
                });

            },
            baseType: function (type) {
                // console.log(type);
                one_way = type == 'BA01' ? true : false;
                two_way = type == 'BA02' ? true : false;

                //   console.log(globalObject);
                //  console.log(one_way, two_way);
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {

                        if (child.name.search("One_Way") >= 0) {
                            if (child.name.search("Bracket_Right") >= 0 && one_way) {
                                if (child.name.search("GMP") >= 0 && bracket_right) {
                                    child.visible = glass_show;
                                } else if (child.name.search("WMP") >= 0 && bracket_right) {
                                    child.visible = !glass_show;
                                } else {
                                    child.visible = !chain_val ? chain_val : bracket_right;
                                }
                            } else if (child.name.search("Bracket_Left") >= 0 && one_way) {
                                if (child.name.search("GMP") >= 0 && !bracket_right) {
                                    child.visible = glass_show;
                                } else if (child.name.search("WMP") >= 0 && !bracket_right) {
                                    child.visible = !glass_show;
                                } else {
                                    child.visible = !chain_val ? chain_val : !bracket_right;
                                }
                            } else {
                                child.visible = one_way ? one_way : false;
                            }
                        } else if (child.name.search("Trimming_Aluminum_Fabric_Two_Way") >= 0 && trimming_show) {
                            child.visible = two_way;
                        } else if (child.name.search("Trimming_Aluminum") >= 0 && child.name.search("First_Hide") >= 0) {
                            child.visible = trimming_show;
                        } else if (child.name.search("Two_Way") >= 0) {
                            if (child.name.search("GMP") >= 0 && two_way) {
                                child.visible = glass_show;
                            } else if (child.name.search("WMP") >= 0 && two_way) {
                                child.visible = !glass_show;
                            } else {
                                child.visible = two_way ? two_way : false;
                            }
                        } else if (child.name.search("DenHaag_Rail_Aluminum") >= 0) {
                            child.visible = false;
                        } else if (child.name.search("CCC") >= 0 && one_way) {
                            child.visible = one_way;
                        } else if (child.name.search("AAA") >= 0) {
                            child.visible = true;
                        } else if (child.name.search("BBB") >= 0) {
                            child.visible = true;
                        } else if (child.name.search("Arrow_Aluminum_First_Hide") >= 0) {
                            child.visible = arrow_line;
                        } else if (child.name.search("Bracket_Right") >= 0) {
                            child.visible = !chain_val ? chain_val : bracket_right;
                        } else if (child.name.search("Bracket_Left") >= 0) {
                            child.visible = !chain_val ? chain_val : !bracket_right;
                        } else if (child.name.search("Manual") >= 0) {
                            child.visible = chain_val;
                        } else if (child.name.search("Motorized") >= 0) {
                            child.visible = !chain_val;
                        } else if (child.name.search("First_Hide") >= 0) {
                            child.visible = false;
                        } else {
                            child.visible = true;
                        }


                    }
                });
            },
            glassOption: function (val) {
                glass_show = val == 'GL01' ? false : true;

                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("One_Way") >= 0) {
                            if (child.name.search("Bracket_Right") >= 0 && one_way) {
                                if (child.name.search("GMP") >= 0 && bracket_right) {
                                    child.visible = glass_show;
                                } else if (child.name.search("WMP") >= 0 && bracket_right) {
                                    child.visible = !glass_show;
                                } else {
                                    child.visible = !chain_val ? chain_val : bracket_right;
                                }
                            } else if (child.name.search("Bracket_Left") >= 0 && one_way) {
                                if (child.name.search("GMP") >= 0 && !bracket_right) {
                                    child.visible = glass_show;
                                } else if (child.name.search("WMP") >= 0 && !bracket_right) {
                                    child.visible = !glass_show;
                                } else {
                                    child.visible = !chain_val ? chain_val : !bracket_right;
                                }
                            } else {
                                child.visible = one_way ? one_way : false;
                            }
                        } else if (child.name.search("Two_Way") >= 0) {
                            if (child.name.search("GMP") >= 0 && two_way) {
                                child.visible = glass_show;
                            } else if (child.name.search("WMP") >= 0 && two_way) {
                                child.visible = !glass_show;
                            } else {
                                child.visible = two_way ? two_way : false;
                            }
                        }
                    }
                });
            },
            borderSection: function (val) {
                if (val == 'BOR04') {
                    side_border_show = false;
                    bottom_border_show=true; 
                }
                else if (val == 'BOR05') {
                    side_border_show = true;
                    bottom_border_show=false;
                }else if (val == 'BOR01') {
                    side_border_show = true;
                    bottom_border_show=true;
                } else {
                    side_border_show = bottom_border_show = false;
                }
                border_show = val == 'BOR02' ? false : true;
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Border_Aluminum") >= 0) {
                            if (child.name.search("Manual") >= 0 && border_show) {
                                child.visible = chain_val;
                            } else if (child.name.search("Motorized") >= 0 && border_show) {
                                child.visible = !chain_val;
                            } else {
                                child.visible = border_show;
                            }
                        }
                    }
                });
                serviceInstance.updateTextureImg(all_texture_url);
            },
            trimmingSection: function (val) {
                // console.log(globalObject);
                trimming_show = val == 'TR02' ? false : true;
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Trimming_Aluminum") >= 0) {
                            if (child.name.search("Manual") >= 0 && trimming_show) {
                                child.visible = chain_val;
                            } else if (child.name.search("Motorized") >= 0 && trimming_show) {
                                child.visible = !chain_val;
                            } else if (child.name.search("Trimming_Aluminum_Fabric_Two_Way") >= 0 && trimming_show) {
                                child.visible = two_way;
                            } else {
                                child.visible = trimming_show;
                            }
                        }
                    }
                });
                serviceInstance.updateTextureImg(all_texture_url);
            },
            controlType: function (type) {
                if(globalObject==undefined){
                    return false;
                }

                var vertical_text_p = scene.getObjectByName('measuremen_text').getObjectByName('vertical_text').position.z;
                var scale_z = globalObject.scale.z;
                var rotation_y = globalObject.rotation.y;
                var light_scale_z = scene.getObjectByName('Light').scale.z;
                if (type == 'PO01' || type=='TO01') {// Manual
                    chain_val = true;
                } else if (type == 'PO02' || type == 'PO05' || type == 'PO07' || type == 'PO08' || type=='TO02'|| type=='TO03' || type=='TO04') {// Motorized
                    chain_val = false;
                }
                if (type == 'PO03') {// Manual right
                    globalObject.scale.z = scale_z > 0 ? scale_z : -scale_z;
                    globalObject.rotation.y = rotation_y > 0 ? rotation_y : -rotation_y;
                    scene.getObjectByName('Light').scale.z = light_scale_z > 0 ? light_scale_z : -light_scale_z;

                    scene.getObjectByName('measuremen_text').getObjectByName('vertical_text').position.z = vertical_text_p > 0 ? vertical_text_p : -vertical_text_p;
                    chain_val = true;
                } else if (type == 'PO04') {// Manual Left
                    globalObject.scale.z = scale_z < 0 ? scale_z : -scale_z;
                    globalObject.rotation.y = rotation_y < 0 ? rotation_y : -rotation_y;
                    scene.getObjectByName('Light').scale.z = light_scale_z < 0 ? light_scale_z : -light_scale_z;

                    scene.getObjectByName('measuremen_text').getObjectByName('vertical_text').position.z = -vertical_text_p;
                    chain_val = true;
                }

                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {

                        if (child.name.search("Valance") >= 0 && valance_hide) {
                            child.visible = false;
                        } else if (child.name.search("Cornice") >= 0) {
                            child.visible = !cornice_hide;
                        } else if (child.name.search("Border_Aluminum") >= 0) {
                            if (child.name.search("Manual") >= 0 && border_show) {
                                child.visible = chain_val;
                            } else if (child.name.search("Motorized") >= 0 && border_show) {
                                child.visible = !chain_val;
                            } else {
                                child.visible = border_show ? true : false;
                            }
                        } else if (child.name.search("Trimming_Aluminum_Fabric_Two_Way") >= 0 && trimming_show) {
                            child.visible = two_way;
                        } else if (child.name.search("Trimming_Aluminum") >= 0) {
                            child.visible = trimming_show;
                        } else if (child.name.search("Inside") >= 0) {
                            child.visible = roll_type == 'INSIDE_ROLL' ? true : false;
                        } else if (child.name.search("Outside") >= 0) {
                            child.visible = roll_type == 'OUTSIDE_ROLL' ? true : false;
                        } else if (child.name.search("One_Way") >= 0) {
                            if (child.name.search("Bracket_Right") >= 0 && one_way) {
                                child.visible = !chain_val ? chain_val : bracket_right;
                            } else if (child.name.search("Bracket_Left") >= 0 && one_way) {
                                child.visible = !chain_val ? chain_val : !bracket_right;
                            } else {
                                child.visible = one_way ? one_way : false;
                            }
                        } else if (child.name.search("Two_Way") >= 0) {
                            if (child.name.search("GMP") >= 0 && two_way) {
                                child.visible = glass_show;
                            } else if (child.name.search("WMP") >= 0 && two_way) {
                                child.visible = !glass_show;
                            } else {
                                child.visible = two_way ? two_way : false;
                            }
                        } else if (child.name.search("DenHaag_Rail_Aluminum") >= 0) {
                            child.visible = false;
                        } else if (child.name.search("Arrow_Aluminum_First_Hide") >= 0) {
                            child.visible = arrow_line;
                        } else if (child.name.search("Curtain") >= 0) {

                        } else if (child.name.search("Bracket_Right") >= 0) {
                            child.visible = !chain_val ? chain_val : bracket_right;
                        } else if (child.name.search("Bracket_Left") >= 0) {
                            child.visible = !chain_val ? chain_val : !bracket_right;
                        } else if (child.name.search("Manual") >= 0) {
                            child.visible = chain_val;
                        } else if (child.name.search("Motorized") >= 0) {
                            child.visible = !chain_val;
                        } else {
                            child.visible = true;
                        }
                    }
                });
            },
            manualControl: function (type) {
                if(globalObject==undefined){
                    return false;
                }

                bracket_right = type == 'OS01' ? true : false;
                var control_position = globalObject.obj_data_info.OBJ_CONTROL_POSITION ? splitString(globalObject.obj_data_info.OBJ_CONTROL_POSITION) : [0, 0, 0];
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Ball_Chain") >= 0) {
                            if (type == 'OS01') {
                                child.position.set(0, 0, 0);
                            } else if (type == 'OS02') {
                                child.position.set(control_position[0], control_position[1], control_position[2]);
                            }
                        }
                        if (child.name.search("Bracket_Right") >= 0) {
                            if (child.name.search("GMP") >= 0 && bracket_right) {
                                child.visible = glass_show;
                            } else if (child.name.search("WMP") >= 0 && bracket_right) {
                                child.visible = !glass_show;
                            } else {
                                child.visible = !chain_val ? chain_val : bracket_right;
                            }
                            //child.visible = !chain_val ? chain_val : bracket_right;
                        }
                        else if (child.name.search("Bracket_Left") >= 0) {
                            if (child.name.search("GMP") >= 0 && !bracket_right) {
                                child.visible = glass_show;
                            } else if (child.name.search("WMP") >= 0 && !bracket_right) {
                                child.visible = !glass_show;
                            } else {
                                child.visible = !chain_val ? chain_val : !bracket_right;
                            }
                            //child.visible = !chain_val ? chain_val : !bracket_right;
                        }
                    }
                });
                if (type == 'OS03') {
                    serviceInstance.controlType('PO03');
                }
                else if (type == 'OS04') {
                    serviceInstance.controlType('PO04');
                }
            },
            rollType: function (type) {
                if (globalObject === undefined) {
                    console.log(globalObject);
                    return false;
                }
                roll_type = type;

                var scale = globalObject.scale;
                var rotation = globalObject.rotation;
                scene.children.forEach(function (e) {
                    if (e.scene_type == 'OBJECT') {
                        if (e.hasOwnProperty('obj_type') && e.obj_type == type) {
                            globalObject = e;
                            e.visible = true;
                            store.set('OBJ_CODE', e.OBJ_CODE);
                        } else {
                            e.visible = false;
                        }
                    }
                });

                globalObject.scale.set(scale.x, scale.y, scale.z);
                globalObject.rotation.set(rotation.x, rotation.y, rotation.z);

                if (all_texture_url) {
                    serviceInstance.updateTextureImg(all_texture_url);
                }
            },
            rollType11: function (type) {
                if(globalObject==undefined){
                    return false;
                }
                roll_type = type;
                serviceInstance.controlType('er');
            },
            bottomBar: function ($type) {
                if(globalObject==undefined){
                    return false;
                }

                //bottom_Aluminum
                bottom_bar_type = $type;
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh && child.name.search("Bottom_Rail_Aluminum") >= 0) {
                        if (bottom_bar_type == 'BOTTOM_BAR1') {
                            child.material.map = aluminium_texture;
                        }
                        if (bottom_bar_type == 'BOTTOM_BAR') {
                            child.material.map = bottom_bar_color ? bottom_bar_color : texture;
                            // child.material.map = texture;
                        }
                    }
                });
            },
            valance: function (val) {
                if(globalObject==undefined){
                    return false;
                }
                var valance_show = ["VAL01", "VAL03", "VAL04"];
                louvo_valance = val == 'VAL03' ? true : false

                valance_hide = valance_show.indexOf(val) >= 0 ? false : true;
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Valance") >= 0) {
                            child.visible = valance_hide ? false : true;
                        }
                        if (child.name.search("Valance_Color") >= 0 && val == 'VAL03') {
                            valance_texture = aluminium_texture;
                            child.material.map = valance_texture;
                        } else if (child.name.search("Valance_Color") >= 0 && val == 'VAL04') {
                            valance_texture = back_side_texture;
                            child.material.map = valance_texture;
                        }
                    }
                });

            },
            armsSection: function (type) {
                arm_type = type == 'ARMS-3' ? true : false;
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("3Arms") >= 0) {
                            child.visible = arm_type ? true : false;
                        } else if (child.name.search("4Arms") >= 0) {
                            child.visible = arm_type ? false : true;
                        }
                    }
                });
            },
            cornice: function (val) {
                //console.log(globalObject);
                cornice_hide = val == 'COR01' ? false : true;
                globalObject.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name.search("Cornice") >= 0) {
                            child.visible = cornice_hide ? false : true;
                        }
                    }
                });
            },
            onWindowResize: function () {
                var orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';
                var cssportrait = {'height': '40%', 'position': 'fixed', 'color': 'black', 'width': '100%'};

                var canvasWidth = $('#threeDImage').width() + 15;
                var canvasHeight = window.innerWidth < 480 ? window.innerHeight - 350 : window.innerHeight-75;

                //  if (window.screen.width <= 768){
                // 	$('.navigation').css({ 'height': '40%', 'position': 'fixed', 'color': 'black', 'bottom': '40px', 'width': '100%' });
                // 	 var canvasHeight = window.innerHeight - $('.navigation').height() + 2;
                // }
                // if (window.screen.width > 768){
                // 		$('.navigation').css({ 'width': '40%', 'height': window.innerHeight - 180 +'px'});
                // 		var canvasWidth = window.innerWidth - $('.navigation').width();
                // 		var canvasHeight = window.innerHeight - 80;
                // }


                // if (window.screen.height > window.screen.width && navigator.userAgent.match(/(Android|BlackBerry|iPhone|iPod|iPad)/) && orientation == 'portrait') {
                // $('.navigation').css(cssportrait);
                // var canvasWidth = window.innerWidth;
                // var canvasHeight = window.innerHeight;
                // } else if (window.screen.height > window.screen.width && orientation == 'portrait') {

                // var canvasWidth = window.innerWidth;
                // var canvasHeight = window.innerHeight - $('.navigation').height()+ 2;
                // $('.navigation').css({'height': '40%', 'position': 'fixed', 'color': 'black', 'width': '100%'});

                // } else if (navigator.userAgent.match(/(Android|BlackBerry|iPhone|iPod|iPad)/) && orientation == 'landscape') {
                // var canvasWidth = window.innerWidth;
                // var canvasHeight = window.innerHeight - 180;
                // $('.navigation').css({'height': canvasHeight + 'px', 'position': 'fixed', 'color': 'black', 'margin-top': '50px', 'width': '40%'});
                // } else {
                // var canvasHeight = window.innerHeight - 180;
                // $('.navigation').css({'height': canvasHeight + 'px', 'position': 'fixed', 'color': 'black', 'width': '40%'});
                // var canvasWidth = window.innerWidth - $('.navigation').width();
                // $('.canvasFoot').css({'width': canvasWidth + 'px'});
                // }
                $('.nav-tabs').attr('style', 'display : block');


                var resizeWidth =  screen.orientation.type == 'landscape-primary' ?  $('#threeDImage').width() : window.innerWidth; //window.innerWidth < 480 ? $('#threeDImage').width() : $('#threeDImage').width(); //$('#threeDImage').width(); // canvasWidth;
                var resizeHeight = screen.orientation.type == 'landscape-primary' ? window.innerHeight : window.innerHeight - 720;
                camera.aspect = resizeWidth / resizeHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(resizeWidth, resizeHeight);
                serviceInstance.render();
            },
            mounting: function (mountType) {
                
                if(globalObject==undefined){
                    return false;
                }

                var measuremen_text = scene.getObjectByName('measuremen_text');
                var vert_text_pos_z = measuremen_text.getObjectByName('vertical_text').position.z;
                //var hori_text_pos_z = measuremen_text.getObjectByName('horizontal_text').position.z;

                if (mountType == 'MT01') {//OutSide
                    var mount = splitString(globalObject.obj_data_info.OBJ_OUTSIDE_SCALE);
                    globalObject.scale.x = mount[0];
                    globalObject.scale.y = mount[1];
                    // globalObject.scale.z = mount[2];
                    globalObject.scale.z = globalObject.scale.z > 0 ? mount[2] : -mount[2];

                    if (vert_outside_text_position.length > 1) {
                        measuremen_text.getObjectByName('vertical_text').position.z = vert_text_pos_z > 0 ? vert_outside_text_position[2] : -vert_outside_text_position[2];
                    }
                    if (hor_outside_text_position.length > 0) {
                        measuremen_text.getObjectByName('horizontal_text').position.y = hor_outside_text_position[1];
                    }
                } else if (mountType == 'MT02') {//Inside
                    var mount = splitString(globalObject.obj_data_info.OBJ_INSIDE_SCALE);
                    globalObject.scale.x = mount[0];
                    globalObject.scale.y = mount[1];
                    //globalObject.scale.z = mount[2];
                    globalObject.scale.z = globalObject.scale.z > 0 ? mount[2] : -mount[2];

                    if (hor_inside_text_position.length > 1) {
                        measuremen_text.getObjectByName('vertical_text').position.z = vert_text_pos_z > 0 ? vert_inside_text_position[2] : -vert_inside_text_position[2];
                    }
                    if (hor_inside_text_position.length > 0) {
                        // console.log(hor_inside_text_position[1]);
                        measuremen_text.getObjectByName('horizontal_text').position.y = hor_inside_text_position[1];
                    }
                    //console.log(hor_inside_text_position);
                }

            },
            canvasImg: function () {
                lat = old_lat;
                lon = old_lon;
                camera.fov = THREE.Math.clamp(camera_fov, 10, camera_fov);
                camera.updateProjectionMatrix();
                serviceInstance.render();
                return renderer.domElement.toDataURL("image/jpeg", 0.3);
                // window.open(renderer.domElement.toDataURL("image/png"), "Final");
                // console.log(img);
            },
            /*  removeObj: function () {
            console.log(loader);
            console.log(scene);
            scene.remove(scene.children[3]);
            },*/
            searchObj: function (obj_code) {
                var is_find = false;
                scene.children.forEach(function (search) {
                    if (search.obj_code == obj_code) {
                        is_find = true;
                    }
                });
                return is_find;
            },
            resetScean: function () {
                camera.fov = THREE.Math.clamp(camera_fov, 10, camera_fov);
                camera.updateProjectionMatrix();
                isMoving = false;
                isReset = true;
                lat = 0;
            },
            zoomScean: function (zoom_type) {
                //var fov = camera.fov + zoom_type * 0.25;
                var fov = zoom_type;
                camera.fov = THREE.Math.clamp(fov, 10, camera_fov + 20);
                camera.updateProjectionMatrix();
            }
        };
        return serviceInstance;
    }).factory('country', function ($http) {
        return {
            init: function () {
                return $http.get(service_url + 'shipping/country', {
                }).then(function (response) {
                    return response.data.data;
                });

            },
        };
    }).factory('getUserInfo', function ($http) {
        return {
            init: function () {
                return $http.get(service_url + 'EcommerceUser/getUserInfo', {
                }).then(function (response) {
                    if (response.data.status) {
                        return response.data.data;
                    } else {
                        return response.data;
                    }
                });

            },
        };
    }).factory('myCache', function($cacheFactory) {
        return $cacheFactory('myData');
    }).factory('AuthInterceptor', ['$log', '$state', '$q', function ($log, $state, $q) {  
        $log.debug('$log is here to show you that this is a regular factory with injection');  
  
        var authInterceptor = {  
            request: function (config) {  
                var accessToken = sessionStorage.getItem('accessToken');  
                if (accessToken == null || accessToken == "undefined") {  
                    $state.go("login");  
                }  
                else {  
                    config.headers["Authorization"] = "bearer " + accessToken;  
                }  
                return config;  
            },  
  
            requestError: function (config) {  
                $state.go("login");  
                return config;  
            },  
  
            response: function (res) {  
                return res;  
            },  
  
            responseError: function (res) {  
                if (res.status == "401") {  
                    $state.go("login");  
                }  
                if (res.status == "400") {  
                    $state.go("login");  
                }  
                if (res.status == "403") {  
                    $state.go("login");  
                }  
                if (res.status == "404") {  
                    $state.go("login");  
                }  
                $q.reject(res)  
                return res;  
            }  
        };  
  
        return authInterceptor;  
    }]);

function splitString(str) {
    return str.length > 0 ? str.split(',') : [];
}


		