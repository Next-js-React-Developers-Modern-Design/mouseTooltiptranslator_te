# How to use

- Basic uses : Hover or select (highlight) on text to translate
  - Test hover with example text
    - Toute nation a le gouvernement qu'elle mérite.
    - Proletarier aller Länder, vereinigt euch!
![Alt Text](/doc/result_0.gif)
- Use <kbd>left ctrl</kbd> to listen tts pronunciation when tooltip is shown(Press <kbd>esc</kbd> to stop voice)
- Use <kbd>right alt</kbd> to translate writing text (or highlighted text) in input box. (Do undo, press <kbd>ctrl</kbd> +<kbd>z</kbd>)
![result](/doc/11.gif)
- Setting page is given for customizing to taste
![result](/doc/14.gif)
- Support online pdf to display translated tooltip using PDF.js (local computer pdf file need additional permission, see [exception](https://github.com/ttop32/MouseTooltipTranslator/blob/main/doc/intro.md#exception))
![result](/doc/12.gif)
- Support dual subtitles for youtube video
![result](/doc/16.gif)
- Process OCR when hold <kbd>left shift</kbd> + <kbd>mouse over</kbd> on image (ex manga)
![result](/doc/15.gif)

# Exception

- If source text language and translate language are same, it will skip
- If web status is offline, it will not work
- If site is <https://chrome.google.com/extensions>, it does not work because Chrome security reason
- If no local file permission given, local pdf cannot be handled. (If not working, darg and drop file on tab)
![result](/doc/10.gif)
