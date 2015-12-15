(function () {

    //常量大写，"全局通用维护"，
    var SPEED = 500;//图片切换速度（注意应该是图片一张移动完成需要的时间）
    var STEP = 10;//图片切换步长（注意应该是图片每一次移动的时间间隔）
    var NUMBER = 6;//图片数量
    var DURATION = 1000;//单张图片停留时间，注意也即是，每次进度条增长的总时间
    var INTERVAL = 50;//进度条变化时间间隔（进度条每次增长的时间间隔）
    var PREV = 0;//上一张图片索引
    var CURRENT = 0;//当前图片索引
    var NEXT = CURRENT + 1;//下一张图片的索引


    //封装原生DOM查找操作，你现在应该明白jQuery的$是什么了，
    // 它就是封装了更复杂的操作查找功能，当然这么返回的是原生DOM元素
    // jQuery中返回的是封装了DOM元素的jQuery对象
    var $ = function (id) {
        return document.getElementById(id);
    }

    var getNum = function (str) {
        if (!str) {
            return 0;
        } else {
            // 查看split()函数作用，parseInt()/parseFloat() 与Number()的区别
            // 地址：https://app.yinxiang.com/shard/s39/nl/8622110/31b61be3-24c5-4475-8e83-22bb3e6866b2?title=js%20%E6%AF%94%E8%BE%83%20%E4%B8%8E%20%E8%87%AA%E5%8A%A8%E8%BD%AC%E6%8D%A2
            return parseInt(str.split('px')[0]);
        }
    }
    //进度条动画

    var process = function (prcsswrap, drtn, intrvl, callback) {
        //查查clientWidth是什么，下面各种距离很重要！
        // 地址：https://app.yinxiang.com/shard/s39/nl/8622110/907597f3-fd16-4b2c-9df6-cf2206740d91?title=DOM%20%E4%B8%AD%E5%90%84%E7%A7%8D%E8%B7%9D%E7%A6%BB%E5%B1%9E%E6%80%A7
        var width = prcsswrap.clientWidth;
        var prcss = prcsswrap.getElementsByClassName('prcss')[0]; //注意区别getElementById() ，有s（因为id唯一），返回的是数组
        var count = drtn/intrvl;
        var offset = Math.floor(width/count); // 注意js除法，不是C/C++中的取整，可以查看下Math.floor/ceil/round()方法区别，以及常用的a.toFixed()
        var tmpCurrent = CURRENT;
        var step = function () {
            if (tmpCurrent !== CURRENT) {   //注意 == 与 = 的区别
                prcss.style.width = '0px'; //浏览器查看元素DOM元素style属性有哪些属性，$.css()本质就是操作它
                return;
            }
            var des = getNum(prcss.style.width) + offset;
            if (des < width) {
                prcss.style.width = getNum(prcss.style.width) + offset + 'px'; //没个intrvl时间执行一次增加一次
            } else if (des == width) {
                clearInterval(intervalId);  //当一个进度条达到终点，取消掉循环函数
                prcss.style.width = '0px';//恢复默认值
                PREV = CURRENT;//调整全局变量，之前的图片序号
                CURRENT = NEXT;//现在期望展现的图片序号
                NEXT++;
                NEXT = NEXT%NUMBER; //%取余操作符，循环取余
                if (callback)
                    callback();  //当进度条完成时，进行下个图片的移动函数，通过参数callback传入
            } else {
                prcss.style.width = width + 'px';
            }
        }
        //step函数一直setInterval(),间隔时间运动，轮播实时进度条每xx毫秒移动offset大小
        //注意返回值是该循环函数的id,上面调用clearInterval（id）取消掉循环函数。
        var intervalId = setInterval(step, intrvl);//每隔intrvl时间间隔，进度条增加offset距离
    };
    //图片动画
    var animation = function (ele, from, to, callback) {
        var distance = Math.abs(to - from); //Math.abs()取绝对值，求图片需要移动的距离
        var cover = 0;
        var symbol = (to - from)/distance;  // 当to是负数很大，from负数小，每次移动负数。
                                            // 当to是0,一个循环，从最后一张图片返回最前面的图片，此时移动是正数。
        var stepLength = Math.floor((distance*STEP)/SPEED); // Math.floor(a)函数求出小于等于a的最大正数值
                                                            // distance*step/speed不好理解 ,等价于(distance/speed)*step好理解
        var step = function () {                            // （每次图片移动的距离/图片移动一次总时间）*step每次移动的时间 = 每次移动的距离
            var des = cover + stepLength;
            if (des < distance) {
                cover += stepLength;
                ele.style.left = getNum(ele.style.left) + stepLength*symbol + 'px';  //注意上面的移动正数负数，两种情况
            } else {
                clearInterval(intervalId); //等同进度条函数中的此处，清理图片移动函数
                ele.style.left = to + 'px';
                if (callback)
                    callback(); // 传入的goOn()函数，封装了下一次的进度条函数 + 图片移动函数 ,即新一次
            }
        }
        var intervalId = setInterval(step, STEP);// step时间图片移动stepLength距离
    }
    //与DOM相关的操作要在页面加载完全之后执行
    window.onload = function () {  // window.onload 是等浏览器页面中所有资源都加载完毕包括图片,
                                   // 而jquery中，$(document).ready() 是封装了原生onDOMContentLoaded事件，当DOM原生加载完毕就执行里面的函数，图片等静态资源可以还没加载ok
                                   // 这样写的必要性是，下面通过getElementById()等等获取页面DOM元素的方法，必须要DOM加载渲染ok才能查找成功，否则找出来的是undefined
        var imgwrap = $('imgwrap');
        var imgs = imgwrap.children;//原生DOM属性，获取该元素所有直接孩子元素
        var navswrap = $('navswrap');
        var navs = navswrap.children; // 返回的类数组
        //封装了图片每一次移动的函数，仅仅在这个函数中计算出from to 位置
        var slide = function (drtn, intrvl, callback) {
            var from = -PREV*1224;
            var to = -CURRENT*1224;
            animation(imgwrap, from, to, callback);
        }
        //一个组合 = 一次进度条动画 + 一次图片位移动画
        var goOn = function (drtn, intrvl) {   //传入进度条每次总时间，以及每次增长一点的时间间隔
            var currentNav = navs[CURRENT]; //通过类数组取出对应要开始移动的进度条包裹的DOM元素
            var prcsswrap = currentNav.getElementsByClassName('prcsswrap')[0]; //原生DOM方法，在某个元素所有孩子元素（包括孙子）查找含有某个类名的元素，注意S，返回类数组
            process(prcsswrap, drtn, intrvl, function () {  //关键！执行进度条移动方法，将图片移动函数当callback回调函数传入
                slide(drtn, intrvl, function () {  //关键！执行图片移动函数，将这个组合goOn 当做callback回调函数传入，递归！
                    goOn(drtn, intrvl); //递归，下一个组合运行
                });
            });
        }
        //绑定点击进度条事件函数
        $('navswrap').addEventListener('click', (function () { //事件代理，注意！看他将事件绑定到所有进度条最外面的包裹元素上，当用户点击进度条，由于事件会冒泡，可以在“父节点”上监听，DOM元素方法，添加click事件的响应函数
            var getElement = function (eve, filter) {  // 封装一个层层往上找元素，直到满足某种条件的元素（条件通过filter传入函数知道）
                                                        //因为点击的元素可能是进度条里面毕竟深颜色的元素，我们要获取进度条包裹元素navwrap
                var element = eve.target;  //原生事件属性event.target，表示用户点击的最开始！的元素（这里有很关键的知识点，事件冒泡）
                while (element) {  // while循环
                    if (filter(element))
                        return element;
                    element = element.parentNode; //DOM原生属性parentNode 父元素,层层往上找
                }
            }
            return function (event) {  //看！ 这里返回了一个函数 ，是一个闭包，只有这个返回的函数可以调用getElement()这个函数，并且里面的变量是唯一的，不是独立的每次改变都能记录下，还记不记得i++ setInterval() 闭包
                var des = getElement(event, function (ele) {
                    return (ele.className.indexOf('navwrap') !== -1); //传入的过滤filter条件函数， DOM属性className 这个元素的class名字， indexOf()查找字符串是否含有某个子字符串，如果有返回起始位置index，否则返回-1
                })
                var index = parseInt(des.dataset.index);// 注意！ DOM元素原生属性dataset,<h1 data-a="1" data-cqh-hehe="2"> 分别有dataset.a==1 dataset.cqhHehe == 2 注意H大写！
                PREV = CURRENT;                          // 看html上 标记着每个进度条的序号和图片序号对应
                CURRENT = index; //当用户点击了某个进度条，我们就将这个进度条所对应的图片最为我们下次要显示的对应图片
                NEXT = (CURRENT+1)%NUMBER;
                slide(DURATION, INTERVAL, function () {  //注意这里又复用了图片函数，也仅仅调用了图片移动函数，将我们点击的图片通过动画显示出来
                    goOn(DURATION, INTERVAL);//当显示出来图片后，又进入新一轮 =  先图片停顿显示，此时进度条动，当进度条动到末尾，开始图片动。。。
                });
            }
        })());// 注意这里使用的自调用函数，因为执行当前定义的函数，返回一个闭包函数，这个闭包函数才是真正绑定给click监听执行的函数
        //开始动画
        goOn(DURATION, INTERVAL); //最开始执行，入口
    }
})()//匿名函数自调用，好处：这样的函数中的变量都是局部的，不会污染全局中的变量，外面不能引用到里面的变量
