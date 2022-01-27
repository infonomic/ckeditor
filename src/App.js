import React from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from '@ckeditor/ckeditor5-build-custom';
import './App.css'

function createModelToViewPositionMapper( view ) {
  return ( evt, data ) => {
      const modelPosition = data.modelPosition;
      const parent = modelPosition.parent;

      // Only the mapping of positions that are directly in
      // the <infoBox> model element should be modified.
      if (!parent || !parent.is( 'element', 'paragraph' ) ) {
          return;
      }

      debugger

      // Get the mapped view element <div class="info-box">.
      const viewElement = data.mapper.toViewElement( parent );

      // Find the <div class="info-box-content"> in it.
      const viewContentElement = findContentViewElement( view, viewElement );

      // Translate the model position offset to the view position offset.
      data.viewPosition = data.mapper.findPositionIn( viewContentElement, modelPosition.offset );
  };
}

// Returns the <div class="info-box-content"> nested in the info box view structure.
function findContentViewElement( editingView, viewElement ) {
  debugger
  for ( const value of editingView.createRangeIn( viewElement ) ) {
      if (value && value.item && value.item.is( 'element', 'span' ) && value.item.hasClass( 'data-text' ) ) {
          return value.item;
      }
  }
}


function App() {
  
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
            <h2>Custom CKEditor 5 Build with Downcast Converter</h2>
            <CKEditor
              editor={CustomEditor}
              config={config}
              data="<p>Hello from CKEditor 5!</p>"
              onReady={editor => {

                editor.editing.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );
                editor.data.mapper.on( 'modelToViewPosition', createModelToViewPositionMapper( editor.editing.view ) );

                editor.conversion.for('downcast').elementToElement({
                  model: 'paragraph',
                  view: (modelElement, { writer }) => {
                    const element = writer.createContainerElement('p', { class: 'data-block' })
                    const span = writer.createAttributeElement('span', { class: 'data-text' });
                    writer.insert(writer.createPositionAt(element, 0), span);
                    return element
                  },
                  converterPriority: 'high',
                })
              }}
              onChange={(event, editor) => {
                const data = editor.getData();
                console.log({ event, editor, data });
              }}
              onBlur={(event, editor) => {
                console.log('Blur.', editor);
              }}
              onFocus={(event, editor) => {
                console.log('Focus.', editor);
              }}
            />
          </div>
        </div>
      </main>
    </>
  )
}

export default App