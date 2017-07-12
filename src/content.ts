import * as $ from 'jquery';
import * as elementReady from 'element-ready';

elementReady('#asana_ui').then((element: any) => {
	setTimeout(
        () => modifyBoard(element)
    );
});

function modifyBoard(element: any) {
    const pageheaderStructureLeft = $('.PageHeaderStructure-left');
    console.dir(pageheaderStructureLeft);

    pageheaderStructureLeft.css("background-color", "red");

    console.dir($(element));
    console.log('foo');
    $(element).css("background-color", "green");
}