import { Component, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldBase } from '../field.base';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { handleEvent } from '../../../_helpers/event-util';
import { PConnFieldProps } from '../../../_types/PConnProps.interface';

// Allow any extra properties to fix "init does not exist" errors
interface RichTextProps extends PConnFieldProps {
  [key: string]: any; 
}

@Component({
  selector: 'app-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, forwardRef(() => ComponentMapperComponent)]
})
export class RichTextComponent extends FieldBase implements OnInit, OnDestroy {
  configProps$: RichTextProps;
  info: any;
  error: boolean;
  status: any;
  
  private themeInterval: any;

  override ngOnInit(): void {
    super.ngOnInit();
    
    // NUCLEAR FIX: Run every 500ms to force color onto the iframe
    this.themeInterval = setInterval(() => {
      // this.forceColorOnIframe();
    }, 500);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.themeInterval) {
      clearInterval(this.themeInterval);
    }
  }

  forceColorOnIframe() {
    // 1. Get current theme color
    const themeElement = document.querySelector('.dark') || document.querySelector('.light') || document.body;
    let textColor = getComputedStyle(themeElement).getPropertyValue('--mat-sys-on-surface').trim();
    if (!textColor) textColor = '#000000';

    // 2. Find iframes
    const iframes = document.querySelectorAll('iframe.tox-edit-area__iframe');
    
    // FIX: Use 'any' to bypass strict HTMLIFrameElement type check
    iframes.forEach((iframe: any) => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.body) {
          // Check if color is already correct to avoid unnecessary repaints
          if (doc.body.style.color !== textColor) {
            
            // Force styles directly on body
            doc.body.style.color = textColor;
            doc.body.style.backgroundColor = 'transparent';
            
            // Force styles via a dedicated <style> tag in the iframe head
            const styleId = 'theme-nuclear-override';
            if (!doc.getElementById(styleId)) {
              const style = doc.createElement('style');
              style.id = styleId;
              style.textContent = `
                body { background-color: transparent !important; color: ${textColor} !important; }
                p, span, div, li, td, th, h1, h2, h3, h4, h5, h6 { color: ${textColor} !important; }
                a { color: inherit !important; }
              `;
              doc.head.appendChild(style);
            } else {
               // Update existing style tag if color changed
               doc.getElementById(styleId).textContent = `
                body { background-color: transparent !important; color: ${textColor} !important; }
                p, span, div, li, td, th, h1, h2, h3, h4, h5, h6 { color: ${textColor} !important; }
                a { color: inherit !important; }
              `;
            }
          }
        }
      } catch (e) {
        // Suppress cross-origin errors
      }
    });
  }

  override updateSelf(): void {
    const rawProps = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps()) as RichTextProps;

    const themeElement = document.querySelector('.dark') || document.querySelector('.light') || document.body;
    let textColor = getComputedStyle(themeElement).getPropertyValue('--mat-sys-on-surface').trim();
    if (!textColor) textColor = '#000000';

    const tinyMceConfig = {
      menubar: false,
      height: 300,
      content_style: `
        body { background-color: transparent !important; color: ${textColor} !important; font-family: Roboto, sans-serif; }
        p { color: ${textColor} !important; }
      `
    };

    // Pass config to all known property locations
    this.configProps$ = {
      ...rawProps,
      configuration: tinyMceConfig,
      editorConfig: tinyMceConfig,
      init: tinyMceConfig,
      additionalProps: tinyMceConfig,
      ...tinyMceConfig
    };

    this.updateComponentCommonProperties(this.configProps$);

    const { value, helperText } = this.configProps$;
    this.value$ = value;
    const { status, validatemessage } = this.pConn$.getStateProps();
    this.status = status;
    this.info = validatemessage || helperText;
    this.error = status === 'error';
  }

  fieldOnChange(editorValue: any) {
    const oldVal = this.value$ ?? '';
    const newVal = editorValue?.editor?.getBody()?.innerHTML ?? editorValue ?? '';
    
    if (newVal.toString() !== oldVal.toString() || this.status === 'error') {
      this.pConn$.clearErrorMessages({
        property: this.propName,
        category: '',
        context: ''
      });
    }
  }

  fieldOnBlur(editorValue: any) {
    const oldVal = this.value$ ?? '';
    if (editorValue.toString() !== oldVal.toString()) {
      handleEvent(this.actionsApi, 'changeNblur', this.propName, editorValue);
    }
  }
}
