/*
variables
*/
var model;
var record_num = 0;

// 获取图表图片并将其显示在<img>标签中
async function fetchAndDisplayImage() {
    const response = await fetch('/plot.png');
    const imageBlob = await response.blob();

    const imgElement = document.getElementById('plot-img');
    imgElement.src = URL.createObjectURL(imageBlob);
}

// 点击按钮后重新加载图像
function reloadImage() {
    // 清空图像
    const imgElement = document.getElementById('plot-img');
    imgElement.src = '';

    // 延时一段时间后重新加载图像
    setTimeout(fetchAndDisplayImage, 500);
}

// 页面加载完成后调用fetchAndDisplayImage函数
window.addEventListener('load', fetchAndDisplayImage);
/*
display after click
*/
function displayme() {
    // record number
    record_num += 1;
    
    // inputs
    var a = parseFloat(document.getElementById("input_a").value) || 0.0;
    var b = parseFloat(document.getElementById("input_X").value) || 0.0;
    var w = parseFloat(document.getElementById("input_Y").value) || 0.0;
    const elem_intp = document.getElementById("intp");
    const elem_outk = document.getElementById("output_K");
    const elem_recd = document.getElementById("txtarea");
    
    // evaluation    
    var KP = function(a,b) {
        var c=a*b**2      
        return c;
    };
    var K_o = KP(a,b)*2;
    
    // log
    var str_output = "a=" + a.toFixed(3).toString() + 
                      ", X=" + b.toFixed(3).toString() +
                      ", Y=" + w.toFixed(3).toString() +
                      ", KI=" + K_o.toFixed(3).toString();
    console.log(str_output);

    // outputs
    if (a/b >= 0.1 && a/b <= 0.8 && w/b >= 1.0 && w/b <= 3.0) {
        elem_intp.innerHTML = '<i class="far fa-grin-wink"></i> \
                               &nbsp; Interpolation';
        elem_intp.classList = "btn btn-outline-success \
                               btn-lg btn-block mb-3";
        elem_outk.style.color = "black";
        elem_recd.innerHTML += "Record " + pad(record_num, 3) +
                               ":  " + str_output + " (Interpolation)" +
                               ";" + "&#13;&#10;";
    } else {
        elem_intp.innerHTML = '<i class="far fa-frown"></i> \
                               &nbsp; Extrapolation';
        elem_intp.classList = "btn btn-outline-danger \
                               btn-lg btn-block mb-3";
        elem_outk.style.color = "#d9534f";
        elem_recd.innerHTML += "Record " + pad(record_num, 3) +
                               ":  " + str_output + " (Extrapolation)" +
                               ";" + "&#13;&#10;";
    }
    elem_outk.value = K_o.toFixed(3);
}


/*
zero padding
*/
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/*
load the model
*/
async function start() {
    //load the model
    model = await tf.loadLayersModel('models/NN_4_64_64_1/model.json')

    //warm up
    var a = tf.tensor([[1, 1, 1, 1]]);
    console.log('a shape:', a.shape, a.dtype);
    var pred = model.predict(a).dataSync();
    console.log('pred:', pred);

    //allow running
    allowrun()
}

/*
allow input
*/
function allowrun() {
    document.getElementById('status').innerHTML = 'Model Loaded';
    document.getElementById("run").disabled = false;
}

function drawGraph() {
    var b=0.0;
    var x=0.0;

    b = parseFloat(document.getElementById("input_b").value);
    x = parseFloat(document.getElementById("input_X").value);

    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制 x 轴
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // 绘制 y 轴
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // 绘制刻度标记
    ctx.font = "12px Arial";
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    // 绘制 x 轴刻度
    for (var i = 0; i <= canvas.width; i += 50) {
      ctx.fillText(i - centerX, i, centerY + 12);
    }

    // 绘制 y 轴刻度
    for (var j = 0; j <= canvas.height; j += 50) {
      ctx.fillText(centerY - j, centerX + 5, j);
    }

    // 绘制图像
    ctx.beginPath();
    ctx.moveTo(0, centerY);

    for (var k = -0.5; k <= 0.5; k += 0.01) {
      var currentX = k * canvas.width;
      var currentY = b * Math.pow(currentX / x, 2);

      ctx.lineTo(k * canvas.width + centerX, centerY - currentY);
    }

    ctx.stroke();
}
function drawmodel(){
    var input_j=0;
    input_j = parseFloat(document.getElementById("input_a").value);
    eel.plot_show(input_j)
}
eel.expose(drawmodel);