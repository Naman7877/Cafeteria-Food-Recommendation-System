export function printTable(
    title: string,
    options: { Option: string; Description: string }[],
) {
    console.log('\n', title);
    console.log('===============================');
    options.forEach(option => {
        console.log(`${option.Option}. ${option.Description}`);
    });
    console.log('===============================');
}
