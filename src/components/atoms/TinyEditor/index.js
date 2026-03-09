import { Editor } from '@tinymce/tinymce-react';
import React, { useRef } from 'react'

const TextArea = ({onEditorChange,value,...rest}) => {
    const editorRef = useRef(null);
    const log = () => {
        if (editorRef.current) {
        
        }
    };
    return (
        <Editor
            onInit={(evt, editor) => editorRef.current = editor}
           
            onEditorChange={onEditorChange}
           
            value={value}
            init={{
            height: 500,
            menubar: true,
            plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
            ],
            // plugins: 'print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
            toolbar: 'table, code undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
            selector:"textarea",
            content_css : 'custom'  
            
            }}
            {...rest}
        />
    )
}

export default TextArea

