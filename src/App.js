import React from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from '@ckeditor/ckeditor5-build-custom';
import './App.css'

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
                editor.conversion.for('downcast').elementToElement({
                  model: 'paragraph',
                  view: (modelElement, { writer }) => {

                    // const { writer } = conversionApi
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