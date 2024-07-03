// SentimentAnalyzer.ts
export class SentimentAnalyzer {
    private positiveWords = [
        'good',
        'great',
        'excellent',
        'amazing',
        'wonderful',
        'perfect',
        'nice',
        'love',
        'like',
        'delicious',
        'fantastic',
        'awesome',
        'superb',
        'fabulous',
        'outstanding',
        'incredible',
        'splendid',
        'brilliant',
        'marvelous',
        'adorable',
        'pleasing',
        'enjoyable',
        'exceptional',
        'phenomenal',
        'tasty',
        'yummy',
        'satisfying',
    ];
    private negativeWords = [
        'bad',
        'terrible',
        'awful',
        'horrible',
        'disgusting',
        'hate',
        'poor',
        'dislike',
        'not good',
        'disappointing',
        'unpleasant',
        'unsatisfactory',
        'regrettable',
        'lousy',
        'mediocre',
        'inferior',
        'miserable',
        'abysmal',
        'distasteful',
        'offensive',
        'repulsive',
        'vile',
        'gross',
        'awful',
        'horrid',
        'appalling',
        'deplorable',
    ];

    analyze(comment: string): string {
        const words = comment.toLowerCase().split(/\W+/);
        let positiveCount = 0;
        let negativeCount = 0;

        for (const word of words) {
            if (this.positiveWords.includes(word)) {
                positiveCount++;
            } else if (this.negativeWords.includes(word)) {
                negativeCount++;
            }
        }

        if (positiveCount > negativeCount) {
            return 'pos';
        } else if (negativeCount > positiveCount) {
            return 'neg';
        } else {
            return 'neutral';
        }
    }
}
