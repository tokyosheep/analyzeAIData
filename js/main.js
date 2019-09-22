  window.onload = () =>{
    "use strict";
    const csInterface = new CSInterface();
    themeManager.init();

    const filePath = csInterface.getSystemPath(SystemPath.EXTENSION) +`/js/`;
    const extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) +`/jsx/`;
    csInterface.evalScript(`$.evalFile("${extensionRoot}json2.js")`);//json2読み込み
      
    const itemList = document.getElementById("itemList");
    const analyze = document.getElementById("analyze");
      
    const toString = Object.prototype.toString;
    function typeOf(obj) {//オブジェクトの型を判定
        return toString.call(obj).slice(8, -1).toLowerCase();
    }  
      
    class ButtonEvent{
        constructor(btn,jsx){
            this.btn = btn;
            this.jsx = jsx;
            this.btn.addEventListener("click",this);
        }
        
        handleEvent(){}
        
        toJsx(){//jsxにアクセスするメソッド
            return new Promise(resolve=>{
                csInterface.evalScript(`$.evalFile("${extensionRoot}${this.jsx}")`,(res)=>{
                    resolve(res);
                });
            });
        }
        
        removeChild(parent){//リストの内容をリセットするメソッド
            while(parent.firstChild){
                parent.removeChild(parent.firstChild);
            }
        }
    }
      
      
    class AnalyzeItems extends ButtonEvent{
        constructor(btn,jsx){
            super(btn,jsx);
            this.list = itemList;
        }
        
        async handleEvent(){
            const objects = JSON.parse(await this.toJsx());
            console.log(objects);
            this.removeChild(this.list);
            this.writeList(objects,this.list);
        }
        
        createElement(parent){//リスト要素を作成して作成した要素をオブジェクトとして返す
            const li = document.createElement("li");
            parent.appendChild(li);
            const ul = document.createElement("ul");
            li.appendChild(ul);
            return {li:li,ul:ul};
        }
        
        
        writeList(objects,parent){//リスト作成関数ここから再帰的にレイヤー、アイテムの情報を処理してゆく
            objects.forEach(obj=>{
                const elm = this.createElement(parent);
                Object.entries(obj).forEach(([key,value])=>{
                    const li = document.createElement("li");
                    console.log(`${key}::${value}`);
                    if(value === "PathItem"||value === "CompoundPathItem"||value=== "GroupItem"){//cssのためにclass追加
                        li.classList.add(value);
                    }else{
                        li.classList.add("other");
                    }
                    elm.ul.appendChild(li);
                    this.analyzeObjArray(key,value,li);
                });
            });
        }
        
        analyzeObjArray(key,value,parent){//配列の中身を分析する関数。配列の中に配列、オブジェクトがある限り再帰的に処理してゆく
            if(Array.isArray(value)){
                this.writeList(value,parent);
            }else if(typeOf(value)  === "object"){
                Object.entries(value).forEach(([k,prop])=>{
                    this.analyzeObjArray(k,prop,parent);
                });
            }else{//値が配列でもオブジェクトでもなければテキストとして書き出し。
                const p = document.createElement("p");
                p.textContent = `${key}::${value}`;
                parent.appendChild(p);
            }
        }
    }
      
    const search = new AnalyzeItems(analyze,"searchItems.jsx");  
}