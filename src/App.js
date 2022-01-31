// https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/conversion/custom-element-conversion.html
import React, { useState, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from '@ckeditor/ckeditor5-build-custom';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import './App.css'
import { Parser } from 'htmlparser2'
import { DomHandler } from 'domhandler'

/**
 * Helper method to map model to view position
 * 
 * @param {*} view 
 */
function createModelToViewPositionMapper(view) {
  return (evt, data) => {
    const modelPosition = data.modelPosition;
    const parent = modelPosition.parent;

    // Only the mapping of positions that are directly in
    // the <paragraph> model element should be modified.
    if (!parent || !parent.is('element', 'paragraph')) {
      return;
    }

    // Get the mapped view element <div class="data-block">.
    const viewElement = data.mapper.toViewElement(parent);

    // Find the <div class="info-box-content"> in it.
    const viewContentElement = findContentViewElement( view, viewElement );

    // Translate the model position offset to the view position offset.
    data.viewPosition = data.mapper.findPositionIn( viewContentElement, modelPosition.offset );
  };
}

/**
 * Helper method to find child span at correct curser offset
 * 
 * @param {*} editingView 
 * @param {*} viewElement 
 * @returns <span class="data-text"> nested in the paragraph view structure. 
 */
function findContentViewElement( editingView, viewElement ) {
  for ( const value of editingView.createRangeIn( viewElement ) ) {
      if ( value.item.is( 'element', 'span' ) && value.item.hasClass( 'data-text' ) ) {
          return value.item;
      }
  }
}

/**
 * An example plugin customization via the downcast pipeline of the editor.
 * 
 * @param {*} editor 
 */
function AddClassToAllLinks(editor) {
  // Both the data and the editing pipelines are affected by this conversion.
  editor.conversion.for('downcast').add(dispatcher => {
    // Links are represented in the model as a "linkHref" attribute.
    // Use the "low" listener priority to apply the changes after the link feature.
    dispatcher.on('attribute:linkHref', (evt, data, conversionApi) => {
      const viewWriter = conversionApi.writer;
      const viewSelection = viewWriter.document.selection;

      // Adding a new CSS class is done by wrapping all link ranges and selection
      // in a new attribute element with a class.
      const viewElement = viewWriter.createAttributeElement('a', {
        class: 'my-green-link'
      }, {
        priority: 5
      });

      if (data.item.is('selection')) {
        viewWriter.wrap(viewSelection.getFirstRange(), viewElement);
      } else {
        viewWriter.wrap(conversionApi.mapper.toViewRange(data.range), viewElement);
      }
    }, { priority: 'low' });
  });
}

/**
 * Paragraph model downcast converter to wrap all text nodes in 
 * inline span elements
 * 
 * @param {*} editor 
 */
function ParagraphConverter(editor) {
  editor.conversion.for('downcast').add(dispatcher => {
    dispatcher.on('insert:paragraph', (evt, data, conversionApi) => {
      // Remember to check whether the change has not been consumed yet and consume it.
      if (!conversionApi.consumable.consume(data.item, 'insert')) {
        return;
      }
      const { writer, mapper } = conversionApi

      // Translate the position in the model to a position in the view.
      const viewPosition = mapper.toViewPosition(data.range.start);

      // Create a <div> element that will be inserted into the view at the `viewPosition`.
      const div = writer.createContainerElement('div', { class: 'data-block' });
      
      // Create the <span> element that will be inserted into the div
      const span = writer.createEditableElement('span', { class: 'data-text' });
      writer.insert(writer.createPositionAt(div, 0), span);

      // Bind the newly created view element to the model element so positions will map accordingly in the future.
      mapper.bindElements(data.item, div);

      // Add the newly created view element to the view.
      writer.insert(viewPosition, div);

      // Remember to stop the event propagation.
      evt.stop();
    });
  });

  // Dynamic mapping for model to view and curser position with correct offset
  editor.editing.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
  editor.data.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
}

function App() {
  const [content, setContent] = useState('<div class="data-block"><span class="data-text">Hello from our custom CKEditor 5 build!</span></div>')
  const [model, setModel] = useState('')

  const config = {
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
    },
    mention: {
      feeds: [
        {
          marker: '@',
          feed: ['@User1', '@User2', '@User3', '@User4', '@User5'],
          minimumCharacters: 1,
        },
      ],
    },
    extraPlugins: [ParagraphConverter, AddClassToAllLinks],
  }

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setContent(data)
  }

  const handleConvertToModel = (event) => {
    const handler = new DomHandler((error, dom) => {
      if (error) {
          console.error(error)
      } else {
          // Parsing completed, do something
          console.log(dom);
          // setModel(JSON.stringify(dom, null, 2))
      }
    });
    
    const parser = new Parser(handler);
    parser.write(content);
    parser.end();
  }

  return (
    <>
      <header>
        Header
      </header>
      <main>
        <div className="editor-panel">
          <p>Editor:</p>
          <div className="editor">
            <h2>Custom CKEditor 5 Build with Paragraph Downcast Converter</h2>
            <CKEditor
              editor={CustomEditor}
              config={config}
              data={content}
              onReady={editor => {
                CKEditorInspector.attach(editor)
              }}
              onChange={handleEditorChange}
              onBlur={(event, editor) => {
                // console.log('Blur.', editor);
              }}
              onFocus={(event, editor) => {
                // console.log('Focus.', editor);
              }}
            />
          </div>
        </div>
        <div className="html-panel">
          <p>Output:</p>
          <div className="output">
          <div dangerouslySetInnerHTML={{__html: content}} />
          </div>
        </div>
        <div className="model-panel">
          <p>Model: <button onClick={handleConvertToModel}>Convert to Model</button> </p> 
          <div className="output">
          <div dangerouslySetInnerHTML={{__html: content}} />
          </div>
        </div>
      </main>
    </>
  )
}

export default App