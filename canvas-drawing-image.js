
var CanvasDrawingButtonView = window.CanvasDrawingButtonView || (() => {
  
  const initialize = (node) => {
    
    try {
      if (!node || !node.hasAttribute || !node.hasAttribute('data-canvas-drawing-image')) {
        //
      } else {
        implementNode(node);
      }
      
      const children = node.children;
      if (children) {
        for (var k in children) {
          initialize(children[k]);
        }
      }
    } catch (e) {
      //
      console.error(e);
    }
    
  }





  const implementNode = (node) => {
    if (!node.hasAttribute("data-canvas-drawing-image-engaged")) {

      node.setAttribute("data-canvas-drawing-image-engaged", true);
      node.style.position = `relative`;
      node.style.cursor = `pointer`;

      node.innerHTML += `
        <img data-holder-imgpreview style="width: 100%; height: 100%; object-fit: contain;" />
      `

      if (!node.querySelector('[data-empty-image]')) {
        node.innerHTML += `
    <div data-empty-image aria-hidden="true">
      <h2>Draw here</h2>
      <p>Click here to draw a picture</p>
    </div>
        `
      }


      const domHolderImgPreview = node.querySelector("[data-holder-imgpreview]");
      const domEmptyImage = node.querySelector("[data-empty-image]");

      domHolderImgPreview.addEventListener('load', (e) => {
        node.isLoaded = true;
        node.isError = false;
        updateMe();
      });

      domHolderImgPreview.addEventListener('error', (e) => {
        node.isLoaded = false;
        node.isError = true;
        updateMe();
      });

      Object.defineProperty(node, 'value', {
        get() {
            return node.img.src || null; // Return the current image source
        },
        set(src) {
            node.setValue(src); // Call the existing setValue method
        },
        enumerable: true,
        configurable: true,
      });

      node.addEventListener('click', (e) => {
        CanvasDrawingModalFeatureMenuView.initialize({
          domInput: node,
          onSelectUploadImage: (isForced) => {
            CanvasDrawingModalUploadImageView.initialize({
              domInput: node,
              onUpdate: (url) => {
                domHolderImgPreview.src = url;
                node.isLoaded = true;
                node.isError = false;
                updateMe();
                node.dispatchEvent(new Event('update', node));
                node.dispatchEvent(new Event('input', node));
              },
              onClose: (url) => {
                //
              },
            })
          },
          onSelectCanvasDrawing: (isForced) => {
            CanvasDrawingModalDrawingCanvasView.initialize({
              domInput: node,
              imageWidthPx: Number(node.getAttribute('data-image-width-px') || 0),
              imageHeightPx: Number(node.getAttribute('data-image-height-px') || 0),
              clientWidth: node.getBoundingClientRect().width,
              clientHeight: node.getBoundingClientRect().height,
              imageData: isForced ? domHolderImgPreview.src : undefined,
              onUpdate: async (imageData) => {
                //
              },
              onSave: async (imageData) => {
                // Function to convert Base64 to Blob
                const base64ToBlob = (base64, type = 'image/png') => {
                  const byteCharacters = atob(base64); // Decode the Base64 string
                  const byteNumbers = new Uint8Array(byteCharacters.length);
                  
                  for (let i = 0; i < byteCharacters.length; i++) {
                      byteNumbers[i] = byteCharacters.charCodeAt(i);
                  }
                  
                  return new Blob([byteNumbers], { type });
                }

                await (new Promise((resolve, reject ) => {
                  CanvasDrawingModalUploadImageView.initialize({
                    domInput: node,
                    blobInput: base64ToBlob(imageData.split(',')[1]),
                    onUpdate: (url) => {
                      domHolderImgPreview.src = url;
                      node.isLoaded = true;
                      node.isError = false;
                      updateMe();
                      node.dispatchEvent(new Event('update', node));
                      node.dispatchEvent(new Event('input', node));
                      resolve();
                    },
                    onClose: (url) => {
                      //
                    },
                  })
                }))
              },
              onClose: async (imageData) => {
                //
              },
            });
          },
          onClose: () => {
            //
          },
        });
      });

      node.img = domHolderImgPreview;

      node.setImageData = (src) => {
        node.img.src = src;
        updateMe();
      }

      node.getImageData = () => {
        return node.img.src;
      }

      node.setValue = (src) => {
        node.setImageData(src);
      }

      const updateMe = () => {
        if (node.img && node.img.src) {
          if (node.isError) {
            domHolderImgPreview.style.visibility = `hidden`;
            domEmptyImage.classList.remove("occupied");
          } else {
            domHolderImgPreview.style.visibility = ``;
            domEmptyImage.classList.add("occupied");
          }
        } else {
          domHolderImgPreview.style.visibility = ``;
          domEmptyImage.classList.remove("occupied");
        }
      }

      updateMe();

    }

    return node;
  }
  
  



  // Create a MutationObserver instance
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          initialize(node);
        });
      }
    });
  });
  
  // Start observing the target node (e.g., document.body or a specific parent element)
  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
  });
  
  document.querySelectorAll('[data-canvas-drawing-image]').forEach((n) => {
    initialize(n);
  })
  
  
  
  
  return {
  }
  
})();






var CanvasDrawingModalFeatureMenuView = window.CanvasDrawingModalFeatureMenuView || (() => {
  const template = `
<div data-drawing-modal>
  <div class="drawing-modal">
    <div data-drawing-modal-content-wrapper class="drawing-modal-content-wrapper">

    <div data-drawing-modal-content-chrome style="
      padding: 40px;
      border: 0 solid #000;
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center; gap: 15px;
      flex-direction: column;
      background: #fff;
      position: absolute;
      ">
      <div style="display: flex; align-items: center; justify-content: center; gap: 15px;
      flex-direction: column;">
        <button data-btn-upload-image class="blue-btn" style="width: 200px;">Upload image</button>
        <button data-btn-canvas-drawing class="blue-btn" style="width: 200px;">Draw</button>
      </div>

      <br/>

      <button data-btn-cancel style="background: none; border: none; opacity: 0.75; width: 200px;">Cancel</button>

    </div>
  </div>
</div>
`;
  
  const initialize = ({
    domInput,
    onSelectUploadImage,
    onSelectCanvasDrawing,
    onClose,
  }) => {


    if (domInput 
      && domInput.hasAttribute
      && domInput.hasAttribute("data-canvas-drawing-image-type")
    ) {
      const type = domInput.getAttribute("data-canvas-drawing-image-type");

      if (type === "draw-only") {
        onSelectCanvasDrawing && onSelectCanvasDrawing(true);
        return;
      }

      if (type === "upload-image-only") {
        onSelectUploadImage && onSelectUploadImage(true);
        return;
      }
    }



    const domPopupMaker = document.createElement("div");
    domPopupMaker.innerHTML = template;
    
    const domPopup = domPopupMaker.children[0];
    const domDrawingModalContentWrapper = domPopup.querySelector('[data-drawing-modal-content-wrapper]');
    const domContentContainer = domPopup.querySelector('[data-drawing-modal-content-chrome]');
    const domBtnUploadImage = domPopup.querySelector('[data-btn-upload-image]');
    const domBtnCanvasDrawing = domPopup.querySelector('[data-btn-canvas-drawing]');
    const domBtnCancel = domPopup.querySelector('[data-btn-cancel]');

    const __showDom = () => {
      document.body.appendChild(domPopup);
    }

    const __hideDom = () => {
      domPopup.remove();
    }
    


    __showDom();


    domDrawingModalContentWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      __hideDom();
      onClose && onClose();
    })




    domBtnUploadImage.addEventListener('click', (e) => {
      e.stopPropagation();
      __hideDom();
      onClose && onClose();
      onSelectUploadImage && onSelectUploadImage();
    });

    domBtnCanvasDrawing.addEventListener('click', (e) => {
      e.stopPropagation();
      __hideDom();
      onClose && onClose();
      onSelectCanvasDrawing && onSelectCanvasDrawing();
    });

    domBtnCancel.addEventListener('click', (e) => {
      e.stopPropagation();
      __hideDom();
      onClose && onClose();
    })

    domContentContainer.addEventListener('click', (e) => {
      e.stopPropagation();
    })


    return {
      domInput,
    }

  }
  
  return {
    initialize,
  }
})();












var CanvasDrawingModalUploadImageView = window.CanvasDrawingModalUploadImageView || (() => {
  const template = `
<div data-drawing-modal>
  <div class="drawing-modal">
    <div class="drawing-modal-content-wrapper">
      <div data-drawing-modal-content-chrome role="main" style="
      padding: 40px;
      border: 0 solid #000;
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center; gap: 15px;
      background: #fff;
      position: absolute;
      ">
        Uploading image...
      </div>
    </div>
  </div>
</div>
`;
  
  const initialize = ({
    domInput,
    blobInput,
    onUpdate,
    onClose,
  }) => {

    const domPopupMaker = document.createElement("div");
    domPopupMaker.innerHTML = template;
    
    const domPopup = domPopupMaker.children[0];
    const domContentContainer = domPopup.querySelector('[data-drawing-modal-content-chrome]');



    const performUpload = async (file, filename) => {
      try {
        const res = await window.UPLOAD_CONTROLLER.uploadImageFile(file, filename);

        if (res && res.url) {
          onUpdate && onUpdate(res.url)
        }

      } catch (e) {
        //
        console.error(e);
        alert(e.message);
      }
    }



    const __showDom = () => {
      document.body.appendChild(domPopup);
    }

    const __hideDom = () => {
      domPopup.remove();
    }
    


    __showDom();





    if (blobInput) {
      (async () => {
        await performUpload(blobInput, "canvas-draw-image.png");
        __hideDom();
        onClose();
      })();

    } else {
      DOMFileHelper.trigger_file_upload({
        onConfirm: (file) => {
          (async () => {
            await performUpload(file);
            __hideDom();
            onClose();
          })();
        },
        onCancel: () => {
          __hideDom();
          onClose();
        },
      });
    }




    return {
      domInput,
    }

  }

  return {
    initialize,
  }
})();












var CanvasDrawingModalDrawingCanvasView = window.CanvasDrawingModalDrawingCanvasView || (() => {
  const template = `
<div data-drawing-modal>
  <div class="drawing-modal">
    <div class="drawing-modal-content-wrapper">
      <div data-drawing-modal-content-chrome class="drawing-modal-content-chrome" role="main">
  
      </div>
    </div>
  </div>
</div>
`;
  
  const initialize = ({
    domInput,
    imageWidthPx,
    imageHeightPx,
    clientWidth,
    clientHeight,
    imageData,
    onUpdate,
    onSave,
    onClose,
  }) => {

    const domPopupMaker = document.createElement("div");
    domPopupMaker.innerHTML = template;
    
    const domPopup = domPopupMaker.children[0];
    const domContentContainer = domPopup.querySelector('[data-drawing-modal-content-chrome]');

    CanvasDrawing.initialize({
      container: domContentContainer,
      domInput,
      imageWidthPx,
      imageHeightPx,
      clientWidth,
      clientHeight,
      imageData,
      onUpdate,
      onSave,
      onClose: (imageData) => {
        __hideDom();
        onClose && onClose(imageData);
      },
    });


    const __showDom = () => {
      document.body.appendChild(domPopup);
    }

    const __hideDom = () => {
      domPopup.remove();
    }
    


    __showDom();


    return {
      domInput,
    }

  }
  
  return {
    initialize,
  }
})();














var CanvasDrawing = window.CanvasDrawing || (() => {
  
  const template = `
<div data-drawing-content>
  <div class="drawing-modal-content" role="main">

    <div class="toolbar" style="flex-wrap: no-wrap; align-items: center; justify-content: space-between; width: 100%;">
      <div class="toolbar" aria-label="Drawing controls" style="flex-wrap: wrap; flex: 1; justify-content: flex-start;">
        <input data-input-color type="color" value="#000000" title="Select Color" aria-label="Brush Color"/>
        <div style="width: 15px;"></div>
        <div style="width: 8px; height: 8px; border-radius: 100%; background-color: #000"></div>
        <input data-input-brushsize type="range" min="1" max="20" value="5" title="Brush Size" aria-label="Brush Size"/>
        <div style="width: 24px; height: 24px; border-radius: 100%; background-color: #000"></div>
        <div style="width: 15px;"></div>
        <select data-input-brushstyle title="Brush Style" aria-label="Brush Style">
            <option value="pencil">Pencil</option>
            <option value="eraser">Eraser</option>
        </select>
        <button data-input-undo type="button">Undo</button>
        <button data-input-clear type="button">Clear</button>
      </div>

      <div class="toolbar" aria-label="Save or Close">
        <button data-btn-close class="close-button" type="button">Close</button>
        <button data-btn-save class="save-button" type="button">Save</button>
      </div>
    </div>

    <div data-holder-canvas style="flex: 1; height: 0; position: relative;
        border: 1px solid #ddd;
        background: #fff;
        box-sizing: border-box;

    ">
      <canvas data-view-canvas class="canvas-container" aria-label="Drawing Canvas" tabindex="0" ></canvas>
    </div>

    <div data-dbg-undo style="display: flex; flex-direction: row; height: 50px; align-items: center; justify-content: center; gap: 10px; display: none;"></div>

  </div>
</div>
`;
  
  const initialize = ({
    container,
    domInput,
    imageWidthPx,
    imageHeightPx,
    clientWidth,
    clientHeight,
    imageData,
    onUpdate,
    onSave,
    onClose,
  }) => {

    const domMaker = document.createElement('div');
    domMaker.innerHTML = template;

    const domDrawingMain = domMaker.children[0];

    const domInputColor = domDrawingMain.querySelector('[data-input-color]');
    const domInputBrushsize = domDrawingMain.querySelector('[data-input-brushsize]');
    const domInputBrushstyle = domDrawingMain.querySelector('[data-input-brushstyle]');
    const domInputUndo = domDrawingMain.querySelector('[data-input-undo]');
    const domInputClear = domDrawingMain.querySelector('[data-input-clear]');
    const domBtnSave = domDrawingMain.querySelector('[data-btn-save]');
    const domBtnClose = domDrawingMain.querySelector('[data-btn-close]');
    const domHolderCanvas = domDrawingMain.querySelector('[data-holder-canvas]');
    const domViewCanvas = domDrawingMain.querySelector('[data-view-canvas]');
    const domDbgUndo = domDrawingMain.querySelector('[data-dbg-undo]');

    container.appendChild(domDrawingMain);


    
    var aspectRatio = 1;

    if (imageWidthPx && imageHeightPx) {
      aspectRatio = imageWidthPx / imageHeightPx;
      domHolderCanvas.style.aspectRatio = aspectRatio;
    } else if (clientWidth && clientHeight) {
      aspectRatio = clientWidth / clientHeight;
      const idealWidth = 1000;
      const idealHeight = idealWidth / aspectRatio;
      domHolderCanvas.style.aspectRatio = aspectRatio;
    }


    const resizeObserver = new ResizeObserver(entries => {
      setTimeout(() => {
        for (let entry of entries) {
          if(entry.target === domHolderCanvas) {
            const { width, height } = entry.contentRect;
            console.log(width, height, aspectRatio);
            domViewCanvas.width = aspectRatio * height;
            domViewCanvas.height = height;
            canvasActions.renderCurrentState();
          }
        }  
      }, 0);
    });
    resizeObserver.observe(domHolderCanvas);




    const ctx = domViewCanvas.getContext('2d');


    const refreshDbgUndo = () => {
      domDbgUndo.innerHTML = ``;
      for (var k in canvasStates.history) {
        const data = canvasStates.history[k];
        const domImg = document.createElement('img');
        domImg.src = data;
        domImg.style.height = `100%`;
        domDbgUndo.append(domImg);
      }
    }


    const handleCanvasStateUpdate = async () => {
      // refreshDbgUndo();
      onUpdate && await onUpdate(canvasStates.getCurrentState());
      domInputUndo.style.opacity = canvasStates.canUndo() ? 1 : 0.4;
      domInput.__canvasState = canvasStates.exportState();
    }



    const canvasStates = {
      cursor: -1,

      history: [],

      save: (inputData = null) => {
        const cursor = canvasStates.cursor;

        if (cursor < canvasStates.history.length - 1 && canvasStates.history.length > 1 && cursor >= 0) {
          canvasStates.history.length = cursor + 1;
        }

        canvasStates.history.push(inputData || domViewCanvas.toDataURL());
        canvasStates.cursor += 1;

        handleCanvasStateUpdate();
      },

      canUndo: () => {
        return canvasStates.history.length > 1 && canvasStates.cursor > 0;
      },

      undo: () => {
        if (canvasStates.canUndo()) {
          canvasStates.cursor -= 1;
          canvasActions.renderCurrentState();
        }    

        handleCanvasStateUpdate();
      },

      getCurrentState: () => {
        return canvasStates.history[canvasStates.cursor];
      },

      importState: (bundle) => {
        canvasStates.cursor = bundle && bundle.cursor;
        canvasStates.history = bundle && bundle.history;
      },

      exportState: () => {
        return {
          cursor: canvasStates.cursor,
          history: canvasStates.history,
        }
      },
    }




    const canvasActions = {
      renderCurrentState: () => {
        const curState = canvasStates.getCurrentState();
        const img = new window.Image();
        img.src = curState;
        img.onload = () => {
          applyBrushStyleCtx();
          ctx.clearRect(0, 0, domViewCanvas.width, domViewCanvas.height);
          ctx.drawImage(img, 0, 0, domViewCanvas.width, domViewCanvas.height);
        };
      },

      canvasPaintClear: () => {
        applyBrushStyleCtx();
        ctx.clearRect(0, 0, domViewCanvas.width, domViewCanvas.height);
        canvasStates.save();
      },

      canvasPaintPen: ({
        penStartX,
        penStartY,
        penEndX,
        penEndY,
      }) => {

        applyBrushStyleCtx(domInputBrushstyle.value);
        ctx.strokeStyle = domInputColor.value;
        ctx.lineWidth = domInputBrushsize.value;
        ctx.beginPath();
        ctx.moveTo(penStartX, penStartY);
        ctx.lineTo(penEndX, penEndY);
        ctx.stroke();
      },



      canvasPaintLoadData: (data) => {
        if (data) {
          canvasStates.save(data);
        } else {
          canvasStates.save();
        }
        canvasActions.renderCurrentState();
      },

    }





    const applyBrushStyleCtx = (brushStyle) => {
      switch (brushStyle) {
        case 'pencil':
          ctx.globalCompositeOperation="source-over";
          ctx.lineCap = 'round';
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = domInputColor.value;
          ctx.lineWidth = domInputBrushsize.value;
          break;
        case 'eraser':
          ctx.globalCompositeOperation="destination-out";
          ctx.lineCap = 'round';
          ctx.globalAlpha = 1.0;
          break;
        default:
          ctx.globalCompositeOperation="source-over";
          ctx.lineCap = 'round';
          ctx.globalAlpha = 1.0;
          ctx.strokeStyle = domInputColor.value;
          ctx.lineWidth = domInputBrushsize.value;
      }
    }
  





    var penStartX = 0.0;
    var penStartY = 0.0;
    var penEndX = 0.0;
    var penEndY = 0.0;
    var penIsDown = false;


    const getActualPos = (e, isTouch) => {
      if (isTouch) {
        const rect = domViewCanvas.getBoundingClientRect();
        const touch = e.touches[0] || e.changedTouches[0];
        return {
          x: (touch.clientX - rect.left) * (domViewCanvas.width / rect.width),
          y: (touch.clientY - rect.top) * (domViewCanvas.height / rect.height)
        };
      }

      const rect = domViewCanvas.getBoundingClientRect();
      const touch = e;
      return {
        x: (touch.clientX - rect.left) * (domViewCanvas.width / rect.width),
        y: (touch.clientY - rect.top) * (domViewCanvas.height / rect.height)
      };
    }


    const doPenStart = (x, y) => {
      penIsDown = true;

      penStartX = x - 0.1;
      penStartY = y - 0.1;

      penEndX = x;
      penEndY = y;

      canvasActions.canvasPaintPen({
        penStartX,
        penStartY,
        penEndX,
        penEndY,
      })

      penStartX = penEndX;
      penStartY = penEndY;
    }
    
    const doPenMove = (x, y) => {
      if (!penIsDown) return;

      penEndX = x;
      penEndY = y;
      
      canvasActions.canvasPaintPen({
        penStartX,
        penStartY,
        penEndX,
        penEndY,
      })

      penStartX = penEndX;
      penStartY = penEndY;
    }

    const doPenEnd = () => {
      if (!penIsDown) return;
      penIsDown = false;
      canvasStates.save();
    }




    const onInputMouseDown = (e) => {
      const {x, y} = getActualPos(e, false);
      doPenStart(x, y);
    }
    const onInputMouseMove = (e) => {
      const {x, y} = getActualPos(e, false);
      doPenMove(x, y);
    }
    const onInputMouseUp = (e) => {
      doPenEnd();
    }
    const onInputMouseLeave = (e) => {
      doPenEnd();
      console.log(e);
    }

    const onInputTouchStart = (e) => {
      const {x, y} = getActualPos(e, true);
      doPenStart(x, y);
    }
    const onInputTouchMove = (e) => {
      const {x, y} = getActualPos(e, true);
      if (!penIsDown) {
        doPenStart(x, y);
      }
      doPenMove(x, y);
    }
    const onInputTouchEnd = (e) => {
      doPenEnd();
    }
    const onInputTouchCancel = (e) => {
      doPenEnd();
    }




    domViewCanvas.addEventListener('mousedown', onInputMouseDown);
    document.addEventListener('mousemove', onInputMouseMove);
    document.addEventListener('mouseup', onInputMouseUp);
    document.addEventListener('mouseleave', onInputMouseLeave);
    domViewCanvas.addEventListener('touchstart', onInputTouchStart, { passive: false });
    document.addEventListener('touchmove', onInputTouchMove, { passive: false });
    document.addEventListener('touchend', onInputTouchEnd);
    document.addEventListener('touchcancel', onInputTouchCancel);












    const onKeyDown = (e) => {
      const isMac = navigator.userAgent.indexOf('Mac') !== -1; // Check if the user is on a Mac
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'z') {
        e.preventDefault(); // Prevent default undo action
        canvasStates.undo();
      }
    }




    domInputClear.addEventListener('click', () => {
      canvasActions.canvasPaintClear();
    });

    domInputUndo.addEventListener('click', () => {
      canvasStates.undo();
    });

    domBtnSave.addEventListener('click', () => {
      save();
    });

    domBtnClose.addEventListener('click', () => {
      close();
    });

    // Event listener for keydown to detect CTRL-Z
    document.addEventListener('keydown', onKeyDown);




    const unload = () => {
      domViewCanvas.removeEventListener('mousedown', onInputMouseDown);
      document.removeEventListener('mousemove', onInputMouseMove);
      document.removeEventListener('mouseup', onInputMouseUp);
      document.removeEventListener('mouseleave', onInputMouseLeave);
      domViewCanvas.removeEventListener('touchstart', onInputTouchStart);
      document.removeEventListener('touchmove', onInputTouchMove);
      document.removeEventListener('touchend', onInputTouchEnd);
      document.removeEventListener('touchcancel', onInputTouchCancel);
      document.removeEventListener('keydown', onKeyDown);

      domDrawingMain.remove();
    }


    const save = async () => {
      const imageData = domViewCanvas.toDataURL('image/png');
      onSave && await onSave(imageData);
      onClose && await onClose(imageData);
      unload();
    }


    const close = async () => {
      const imageData = domViewCanvas.toDataURL('image/png');
      onClose && await onClose(imageData);
      unload();
    }



    if (domInput.__canvasState) {
      canvasStates.importState(domInput.__canvasState);
      canvasActions.renderCurrentState();
    } else {
      // if (imageData && imageData.substring(0, 5) === "data:") {
      canvasActions.canvasPaintLoadData(imageData);
    }


    return {
      domViewCanvas,
      canvasStates,
      canvasActions,
      close,
    }
    
  }


  return {
    initialize,
  }
  
})();

