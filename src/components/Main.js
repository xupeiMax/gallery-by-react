require('normalize.css/normalize.css');
require('styles/App.css');

import React from 'react';

//获取图片相关的数据
var imageDatas = require('sources/imageDatas.json');

//利用自执行函数，将图片名信息转成图片URL路径信息
imageDatas = (function genImageURL(imageDatasArr){
  for(var i = 0,j = imageDatasArr.length;i < j; i++){
    var singleImageData = imageDatasArr[i];

    singleImageData.imageURL = require('../images/' + singleImageData.fileName);
    imageDatasArr[i] = singleImageData;
  }

  return imageDatasArr;
})(imageDatas);

//获取区间内的一个随机值
function getRangeRandom(low,high){
  return Math.ceil(Math.random() * (high - low) + low);
}

//获取0~30°之间的一个任意正负值
function get30DegRandom(){
  return ((Math.random() > 0.5 ?'':'-') + Math.ceil(Math.random()*30));
}

//图片组件
class ImgFigure extends React.Component{
  constructor(props){
    super(props);
    this.handleClick =this.handleClick.bind(this);
  }
  /*
   *imgFigure的点击处理函数
   */
  handleClick(e){
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }
    
    e.preventDefault();
    e.stopPropagation();
  }

  render(){

    var styleObj = {};

    //如果props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj = this.props.arrange.pos;
    }

    //如果图片的旋转角度有值且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      (['MozTransform', 'msTransform', 'WebkitTransform','transform']).forEach(value=>
        styleObj[value] = 'rotate(' + this.props.arrange.rotate +'deg)'
      )
    }

    //如果图片居中，z-index值要大于不居中图片，小于控制组件
    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    }

    var imgFigureClassName = 'img-figure';
    imgFigureClassName += this.props.arrange.isInverse ? ' is-inverse':'';
    var imgBackClassName = 'img-back';
    imgBackClassName += this.props.arrange.isInverse ? ' is-visible' : '';

    return(
      <figure className={imgFigureClassName} ref="figure" style={styleObj} onClick={this.handleClick}>
        <img src={this.props.data.imageURL}
             alt={this.props.data.title}
        />
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
          <div className={imgBackClassName} onClick={this.handleClick}>
            <p>{this.props.data.desc}</p>
          </div>
        </figcaption>
      </figure>
    );
  }
}

//控制组件
class ControllerUnit extends React.Component{
  constructor(props){
    super(props);
    this.state ={};
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e){
    //如果点击是选中的图片则翻转图片，否则将其居中
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center();
    }

    e.preventDefault();
    e.stopPropagation();
  }

  render(){
    var controllerUnitClassName = 'controller-unit';
    if(this.props.arrange.isCenter){
      controllerUnitClassName += ' is-center';
      if(this.props.arrange.isInverse){
        controllerUnitClassName += ' is-inverse';
      }
    }

    return(
      <span className={controllerUnitClassName} onClick={this.handleClick}></span>
    )
  }
}

//主组件
class AppComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
       imgsArrangeArr: [
        /* {
          pos:{
            left: 0,
            top: 0
          },
          rotate: 0,  //旋转角度
          isInverse: false,  //图片正反面
          isCenter: false   //图片是否居中
         }
         */
       ]
    };
    this.Constant={
      centerPos: {
        left:0,
        top:0
      },
      hPosRange: {   //水平方向的取值范围
        leftSecX:[0,0],
        rightSecX:[0,0],
        y: [0,0]
      },
      vPosRange: {   //垂直方向的取值范围
        x: [0,0],
        topY: [0,0]
      }
    };
    this.inverse = this.inverse.bind(this);
  }

  /*
   * 翻转图片
   * @param index 当前被翻转图片index
   * @return {Function} 闭包函数,待执行
   */
  inverse(index){
    return ()=>{
      var imgsArrangeArr = this.state.imgsArrangeArr;
      imgsArrangeArr[index].isInverse = !imgsArrangeArr[index].isInverse;
      this.setState({
        imgsArrangeArr: imgsArrangeArr
      });
    }
  }

  /*
   * 重新布局所有图片
   * @param centerIndex 指定居中排布哪个图片
   */
  rearrange(centerIndex){
    var imgsArrangeArr = this.state.imgsArrangeArr,
        Constant = this.Constant,
        centerPos = Constant.centerPos,
        hPosRange = Constant.hPosRange,
        vPosRange = Constant.vPosRange,
        hPosRangeLeftSecX = hPosRange.leftSecX,
        hPosRangeRightSecX = hPosRange.rightSecX,
        hPosRangeY = hPosRange.y,
        vPosRangeX = vPosRange.x,
        vPosRangeTopY = vPosRange.topY,

        imgsArrangeTopArr = [],
        topImgNum = Math.floor(Math.random() * 2),  //取一个或不取
        topImgSpliceIndex = 0,
        imgsArrangeCenterArr = imgsArrangeArr.splice(centerIndex,1);
    //首先居中 centerIndex 的图片的状态信息,居中图片不旋转
    imgsArrangeCenterArr[0] = {
        pos: centerPos,
        rotate: 0,
        isCenter: true
    }

    //取出要布局上侧的图片的状态信息
    topImgSpliceIndex = Math.ceil(Math.random() * (imgsArrangeArr.length - topImgNum));
    imgsArrangeTopArr = imgsArrangeArr.splice(topImgSpliceIndex,topImgNum); //注意是splice()方法

    //布局位于上侧的图片
    imgsArrangeTopArr.forEach(function(value,index){
      imgsArrangeTopArr[index] = {
        pos:{
          top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
          left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
        },
        rotate:get30DegRandom(),
        isCenter: false
      };
    });

    //布局左右两侧的图片
    for(var i = 0, j = imgsArrangeArr.length, k = j / 2; i < j; i++){
      var hPosRangeLORX = null;

      //前半部分布局左边，后半部分布局右边
      if(i < k){
        hPosRangeLORX = hPosRangeLeftSecX;
      }else{
        hPosRangeLORX = hPosRangeRightSecX;
      }

      imgsArrangeArr[i] = {
        pos:{
          top: getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
          left: getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
        },
        rotate:get30DegRandom(),
        isCenter: false
      };
    }

    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
    }

    imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);
    this.setState({
      imgsArrangeArr: imgsArrangeArr
    });
  }

  /*
   * 利用rearrange函数,居中对应index的图片
   * @param index 指定居中排布哪个index图片
   * @return {Function}
   */
  center(index){
    return ()=>this.rearrange(index)
  }

  //组件加载后，为每张图计算其位置的范围
  componentDidMount(){
    //首先拿到舞台的大小
    var stageDOM = this.refs.stage,
        stageW = stageDOM.scrollWidth,
        stageH = stageDOM.scrollHeight,
        halfStageW = Math.ceil(stageW / 2),
        halfStageH = Math.ceil(stageH / 2);

    //拿到一个imageFigure的大小
    var imgFigureDOM = this.refs.imgFigure0.refs.figure, //创建的component要接着refs到下面的真实DOM节点,
        imgW = imgFigureDOM.scrollWidth,  // 才有scrollWidth等一大堆属性,
        imgH = imgFigureDOM.scrollHeight,  // 真是坑,debug好长时间
        halfImgW = Math.ceil(imgW / 2),
        halfImgH = Math.ceil(imgH / 2);

    //计算中心图片的位置点
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH
    };

    //计算左侧，右侧区域图片排布位置的取值范围
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;
    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;
    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH;

    //计算上侧区域图片排布位置的取值范围
    this.Constant.vPosRange.topY[0] = -halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    this.rearrange(0);
  }

  render() {

    var controllerUnits = [],
        imgFigures = [];

    imageDatas.forEach(function(value,index) {

      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index] = {
          pos:{
            left: 0,
            top: 0
          },
          rotate:0,
          isInverse: false,
          isCenter: false
        };
      }

      imgFigures.push(<ImgFigure key={index} data={value} ref={'imgFigure' + index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>);

      controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/>)
    }.bind(this));

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );

  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
