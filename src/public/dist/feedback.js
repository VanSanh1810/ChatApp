/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/configs/client/feedback.js":
/*!****************************************!*\
  !*** ./src/configs/client/feedback.js ***!
  \****************************************/
/***/ (() => {

eval("window.addEventListener('DOMContentLoaded', function () {\r\n    const feedbackForm = document.getElementById('feedbackForm');\r\n    feedbackForm.addEventListener('submit', function (event) {\r\n        event.preventDefault();\r\n        const feedbackData = document.getElementById('feedbackData');\r\n        fetch('/api/userFeedback', {\r\n            method: 'POST',\r\n            headers: {\r\n                Accept: 'application/json',\r\n                'Content-Type': 'application/json',\r\n                'CSRF-Token': Cookies.get('XSRF-TOKEN'),\r\n            },\r\n            body: JSON.stringify({\r\n                feedbackData: feedbackData.value,\r\n            }),\r\n        }).then(() => {\r\n            window.location.href = '/main/index';\r\n        });\r\n    });\r\n});\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9zcmMvY29uZmlncy9jbGllbnQvZmVlZGJhY2suanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2NoYXRhcHAvLi9zcmMvY29uZmlncy9jbGllbnQvZmVlZGJhY2suanM/ZTVkZiJdLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGZlZWRiYWNrRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmZWVkYmFja0Zvcm0nKTtcclxuICAgIGZlZWRiYWNrRm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGNvbnN0IGZlZWRiYWNrRGF0YSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmZWVkYmFja0RhdGEnKTtcclxuICAgICAgICBmZXRjaCgnL2FwaS91c2VyRmVlZGJhY2snLCB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcclxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXHJcbiAgICAgICAgICAgICAgICAnQ1NSRi1Ub2tlbic6IENvb2tpZXMuZ2V0KCdYU1JGLVRPS0VOJyksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcclxuICAgICAgICAgICAgICAgIGZlZWRiYWNrRGF0YTogZmVlZGJhY2tEYXRhLnZhbHVlLFxyXG4gICAgICAgICAgICB9KSxcclxuICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL21haW4vaW5kZXgnO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./src/configs/client/feedback.js\n");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/configs/client/feedback.js"]();
/******/ 	
/******/ })()
;